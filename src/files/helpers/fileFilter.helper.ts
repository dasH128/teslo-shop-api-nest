export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is Empty'), false);

  const fileExptension = file.mimetype.split('/')[1];
  const validExtensions = ['jpeg', 'png'];

  if (!validExtensions.includes(fileExptension)) {
    return callback(null, false);
  }

  callback(null, true);
};
