const { getPrinters } = require('pdf-to-printer');

getPrinters()
  .then(printers => {
    console.log(printers);
  })
  .catch(err => {
    console.error(err);
  });
