import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/db/db.js';
import userRouter from './src/routes/userRoutes.js';
import chatRouter from './src/routes/chatRoutes.js';
import messageRouter from './src/routes/messageRoutes.js';
import creditRouter from './src/routes/creditRoutes.js';

const PORT = 8080;

await connectDB();

app.get('/', (req, res) => {
  res.send('server is live');
});
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

app.listen(PORT, () => {
  console.log('Server running at port: ' + PORT);
});