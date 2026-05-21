import mongoose from 'mongoose';
import 'dotenv/config';

const DB_URI = process.env.MONGO_URI_ATLAS 

const dbConnect = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('************************************************\n ESPERE: Conectado a la base de datos MongoDB \n************************************************');
    } catch (error) {
        console.error('****************************\n Error al conectar a la DB \n****************************\nERROR:', error.message);
        process.exit(1);
    }
};

export default dbConnect;
