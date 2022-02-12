const express = require('express');
const app = express();
app.use(express.static('public'));

const PORT = 3000;
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
