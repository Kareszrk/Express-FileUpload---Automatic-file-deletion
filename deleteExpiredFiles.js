const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require('path');

  // User uploaded files are being transported to object storage servers.
  app.use(fileUpload({ // express-fileupload always stores files with a dash and the current date when the file has been created on the server (meaning: uploaded)
    useTempFiles : true,
    tempFileDir : 'tempUser_fileUploads'
  }));

  // And also, we don't always trust to controllers we also run an algorithm to delete expired files, since express-fileupload doesn't do it, and
  // we don't want to fill up the server's storage for security and maintanence reasons. Also express-fileupload names files with the current timestamp
  // so it's easy to delete them, we just compare current date and the date mentioned in the file's name. This algorithm also let's us not to care about
  // deleting temp files anymore when writing code. And also it's a good practice against attacks that tries to fill up the server's storage.

  function deleteExpiredFiles(directory, maxAgeInMilliseconds) {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }

      const currentTime = Date.now();

      files.forEach((file) => {
        const filePath = path.join(directory, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error('Error retrieving file stats:', err);
            return;
          }

          const fileAge = currentTime - stats.mtimeMs;

          if (fileAge > maxAgeInMilliseconds) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
              }
            });
          }
        });
      });
    });
  }

  const uploadDirectory = 'tempUser_fileUploads/'; // Replace with the actual directory path
  const maxFileAge = 50 * 60 * 1000; // Maximum file age: 50 minute

  setInterval(() => {
    deleteExpiredFiles(uploadDirectory, maxFileAge);
  }, 60 * 60 * 1000); // Run every 1 hour
