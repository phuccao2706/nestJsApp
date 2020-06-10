import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('api')
export class UploadController {
  deleteFiles(idFiles, callback) {
    if (idFiles.length == 0) callback();
    else {
      console.log(idFiles);
      let idFile = idFiles.pop();
      fs.unlink(`./${idFile}`, function(err) {
        if (err) callback(err);
        else {
          console.log(idFile + ' deleted.');
          this.deleteFiles(idFiles, callback);
        }
      });
    }
  }

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
  uploadFile(@UploadedFile() { path }) {
    return path;
  }

  @Delete('removeImg')
  async removeImage(@Body() { idFiles }: any) {
    try {
      // // console.log(idFiles.idFiles);
      // return this.deleteFiles(
      //   idFiles.map(item => 'uploads/' + item),
      //   err => console.log(err),
      // );
      fs.unlinkSync(`uploads/${idFiles[0]}.png`);
    } catch (err) {
      throw err;
    }
  }
}
