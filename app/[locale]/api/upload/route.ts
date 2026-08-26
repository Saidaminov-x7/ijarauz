import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { generateSafeFilename, isValidFileType, isValidFileSize } from '@/lib/security';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const payload = verify(token, process.env.JWT_SECRET || 'jwt-secret') as { userId: string };

    
    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const uploadedFiles: string[] = [];
    
    // Validate and save each file
    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}` },
          { status: 400 }
        );
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }
      
      // Generate safe filename
      const safeFilename = generateSafeFilename(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const filepath = join(uploadDir, safeFilename);
      
      // Save file
      await writeFile(filepath, buffer);
      uploadedFiles.push(`/uploads/${safeFilename}`);
    }
    
    return NextResponse.json(
      { files: uploadedFiles },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}