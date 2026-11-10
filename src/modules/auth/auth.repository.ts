import {prisma} from "../../database/client.ts"
export function findUserByEmail(email: string){
    return prisma.user.findUnique({
        where: {email},
        select : {id:true, email:true, passwordHash: true, role: true,status: true},
    })
}