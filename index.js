const app = require('./app.js');
const port = process.env.PORT || 5000;


app.listen(port, () => {
    console.log(`Random user server running on port ${port}`)
});
