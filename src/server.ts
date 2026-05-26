import { app } from "./app";
import { denunciaRouter } from "./routes/denunciasRouter";
import { usuarioRouter } from "./routes/usuarioRouter";
import { departamentoRouter } from "./routes/departamentoRouter";
import { tipoDenunciaRouter } from "./routes/tipoDenunciaRouter";
import dotenv from "dotenv";

dotenv.config();

app.use("/denuncias", denunciaRouter);
app.use("/usuarios", usuarioRouter);
app.use("/departamentos", departamentoRouter);
app.use("/tipo-denuncia", tipoDenunciaRouter)

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});