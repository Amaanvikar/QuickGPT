import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/db/db.js';

const PORT = 8080;

await connectDB();

app.get('/', (req, res) => {
  res.send('server is live');
});

app.listen(PORT, () => {
  console.log('Server running at port: ' + PORT);
});