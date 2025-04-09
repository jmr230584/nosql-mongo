import { Request, Response } from "express";
import { DataBaseModelMongo } from "../model/DataBaseModelMongo";
import { MongoClient, ObjectId } from "mongodb";
import { Aluno } from "../model/Aluno";


interface AlunoDTO {
    idAluno: string,
    nome: string;
    sobrenome: string;
    dataNascimento?: Date;
    endereco?: string;
    email?: string;
    celular: string;
}

/**
 * Controlador para operações relacionadas aos alunos.
 */
class AlunoControllerMongo extends Aluno{
    private static collectionName = "alunos"; // Nome da coleção no MongoDB

    /**
     * Lista todos os alunos.
     * @param req Objeto de requisição HTTP.
     * @param res Objeto de resposta HTTP.
     * @returns Lista de alunos em formato JSON.
     */
    static async todos(req: Request, res: Response) {
        try {
            const db = await new DataBaseModelMongo().getDb(process.env.DB_NAME as string);
            const alunos = await db.collection(AlunoControllerMongo.collectionName).find().toArray();
            res.status(200).json(alunos);
        } catch (error) {
            console.error(`Erro ao listar alunos: ${error}`);
            res.status(400).json("Erro ao recuperar as informações do Aluno");
        }
    }

    /**
     * Cadastra um novo aluno.
     * @param req Objeto de requisição HTTP com os dados do aluno.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: AlunoDTO = req.body;
            const db = await new DataBaseModelMongo().getDb(process.env.DB_NAME as string);

            const result = await db.collection(AlunoControllerMongo.collectionName).insertOne(dadosRecebidos);

            if (result.insertedId) {
                res.status(200).json(`Aluno cadastrado com sucesso. ID: ${result.insertedId}`);
            } else {
                res.status(400).json("Não foi possível cadastrar o aluno no banco de dados");
            }
        } catch (error) {
            console.error(`Erro ao cadastrar o aluno: ${error}`);
            res.status(400).json("Erro ao cadastrar o aluno");
        }
    }

    /**
     * Remove um aluno.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idAluno = req.params.idAluno; // ID do aluno passado na URL
            console.log(req.params.id);
            const db = await new DataBaseModelMongo().getDb(process.env.DB_NAME as string);

            const result = await db.collection(AlunoControllerMongo.collectionName).deleteOne({ _id: new ObjectId(idAluno) });

            if (result.deletedCount) {
                return res.status(200).json("Aluno removido com sucesso");
            } else {
                return res.status(404).json("Aluno não encontrado");
            }
        } catch (error) {
            console.error(`Erro ao remover o aluno: ${error}`);
            return res.status(500).json("Erro ao remover o aluno");
        }
    }

    /**
     * Método para atualizar o cadastro de um aluno.
     * 
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno
     * @param res Objeto de resposta do Express
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Captura o ID do aluno da URL
            const idAluno = req.params.idAluno;
    
            if (!idAluno) {
                return res.status(400).json({ message: "O ID do aluno é obrigatório." });
            }
    
            // Verifica se o ID é válido
            if (!ObjectId.isValid(idAluno)) {
                return res.status(400).json({ message: "O ID fornecido é inválido." });
            }
    
            // Captura os dados recebidos no corpo da requisição
            const { nome, sobrenome, dataNascimento, endereco, email, celular } = req.body;
    
            // Valida se os campos obrigatórios estão presentes
            if (!nome || !sobrenome || !celular) {
                return res.status(400).json({ message: "Campos obrigatórios faltando." });
            }
    
            // Cria o objeto com os dados no formato esperado pelo modelo
            const dadosAtualizados = {
                nome,
                sobrenome,
                dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
                endereco: endereco || "",
                email: email || "",
                celular,
            };

            console.log(dadosAtualizados);
    
            // Atualiza o aluno no banco
            const alunoAtualizado = await Aluno.atualizarCadastroAluno(new ObjectId(idAluno), dadosAtualizados);
    
            // Verifica se a atualização foi bem-sucedida
            if (!alunoAtualizado) {
                return res.status(404).json({ message: "Aluno não encontrado." });
            }
    
            return res.status(200).json({ message: "Aluno atualizado com sucesso." });
        } catch (error) {
            console.error("Erro ao atualizar aluno:", error);
            return res.status(500).json({ message: "Erro ao atualizar aluno." });
        }
    }
    
}

export default AlunoControllerMongo;
