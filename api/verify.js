import db from "./database.js";
export async function userexists(username){
    const user = await db.query(
        "SELECT id FROM users WHERE username = $1;",
        [username]
    );
    return user.rows.length > 0? true : false;
}