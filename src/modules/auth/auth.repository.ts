import {prisma} from "../../database/client.ts"

export function findUserByEmail(email: string){
    return prisma.user.findUnique({
        where: {email},
        select : {id:true, email:true, passwordHash: true, role: true,status: true},
    })
}

type CreateUserData = {
    email: string;
    passwordHash: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

export function createUser(data: CreateUserData){
    return prisma.user.create({
        data,
        select: {id: true, email: true, role: true, status: true},
    })
}