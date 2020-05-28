import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('api')
export class UploadController {
  @Post('uploadImg')
  @UseInterceptors(
    FileInterceptor('rawImage', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const randomName = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(
            null,
            `${+new Date()}-${randomName}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file) {
    console.log(file);
  }
}
