import request from "supertest";
import { app } from "../app";
import { connection } from "../dbConnection";

describe("Fluxo Principal E2E - Da Criação à Denúncia", () => {

    let tokenAdmin: string;
    let tokenCidadao: string;
    let idDepartamento: number;
    let idTipoDenuncia: number;


    beforeAll(async () => {

        jest.spyOn(app, "listen").mockImplementation(() => { return {} as any; });
        await require("../server");


        await connection("comentarios").del();
        await connection("confirmacoes").del();
        await connection("denuncias").del();
        await connection("tipo_denuncia").del();
        await connection("departamentos").del();
        await connection("usuarios").del();
    });


    afterAll(async () => {
        await connection.destroy();
    });



    test("1. Deve criar um Administrador (Funcionário) e fazer Login", async () => {
        const resSignup = await request(app).post("/usuarios").send({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: "123"
        });


        expect(resSignup.status).toBe(201);


        await connection("usuarios").where({ email: "admin@teste.com" }).update({ papel: "funcionario" });

        const resLogin = await request(app).post("/usuarios/login").send({
            email: "admin@teste.com",
            senha: "123"
        });

        expect(resLogin.status).toBe(200);
        tokenAdmin = resLogin.text;
    });

    test("2. Deve criar um Cidadão Comum e fazer Login", async () => {
        await request(app).post("/usuarios").send({
            nome: "Cidadão Teste",
            email: "cidadao@teste.com",
            senha: "123"
        });

        const res = await request(app).post("/usuarios/login").send({
            email: "cidadao@teste.com",
            senha: "123"
        });

        expect(res.status).toBe(200);
        tokenCidadao = res.text;
    });

    test("3. Admin deve criar um Departamento", async () => {
        const admin = await connection("usuarios").where({ email: "admin@teste.com" }).first();

        const res = await request(app)
            .post("/departamentos")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send({
                nome: "Departamento de Obras",
                endereco: "Rua das Obras, 100",
                horario_funcionamento: "08h-18h",
                gerente_id: admin.id
            });

        expect(res.status).toBe(201);
        idDepartamento = res.body.id;
    });


    test("4. Admin deve criar um Tipo de Denúncia vinculado ao Departamento", async () => {
        const res = await request(app)
            .post("/tipo-denuncia")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send({
                nome: "Buraco na via",
                departamento_id: idDepartamento
            });

        expect(res.status).toBe(201);

        idTipoDenuncia = res.body.ID || res.body.id;
    });

    test("5. Cidadão deve criar uma Denúncia com sucesso", async () => {
        const res = await request(app)
            .post("/denuncias")
            .set("Authorization", `Bearer ${tokenCidadao}`)
            .send({
                titulo: "Buraco enorme na minha rua",
                descricao: "Está atrapalhando o trânsito",
                endereco_denuncia: "Av. Principal, 500",
                tipo_denuncia_id: idTipoDenuncia,
                anonimo: false
            });

        expect(res.status).toBe(201);

        const denunciaNoBanco = await connection("denuncias").where({ id: res.body.id }).first();
        expect(denunciaNoBanco).toBeTruthy();
    });

    test("6. Admin consulta estatísticas e vê a nova denúncia", async () => {
        const res = await request(app)
            .get("/denuncias/estatisticas")
            .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body.total_denuncias).toBeGreaterThanOrEqual(1);
    });

});