import { useState } from "react"
import { db } from "./dbDixie/initDb"
import { get, set } from 'idb-keyval';
import { initDB, Stores } from "./dbVanila/iniDb"
import { addData, getStoreData, deleteData, updateData } from "./dbVanila/userDb"
import { useLiveQuery } from "dexie-react-hooks"

export default function Home() {
  const [isDBReady, setIsDBReady] = useState(false)
  const [users, setUsers] = useState([])

  const handleInitDB = async () => {
    const status = await initDB()
    setIsDBReady(status)
  }

  //dixie DB
  const addFriend= async (e) =>{
    try {
      e.preventDefault()
  
      const target = e.target
      const name = target.name.value
      const email = target.email.value
      await db.friends.add({
        name,
        email
      });
    } catch (error) {
      console.log(error)
    }
  }
  const friends = useLiveQuery(
    async () => await db.friends.toArray()
  );
  
  const updatequery = async (id) =>{
    await db.friends.update(id, {name: "booooo"});
  }

  const deletequery = async (id) =>{
    await db.friends.delete(id);
  }

  const searchQuery = async () =>{
    const abcFriends = await db.friends
    .where("name")
    .startsWithAnyOfIgnoreCase(["asd", "b", "c"])
    .toArray();

    console.log(abcFriends)
  }

  //IDB-Keyval DB
  const setUser = async(e)=>{
    try {
      e.preventDefault()

      const target = e.target
      const name = target.name.value
      const email = target.email.value
      const id = Date.now()
      const user = {
        name : name,
        email : email,
        id : id,
      }
      await setDb(id, user);
    } catch (error) {
      console.log(error)
    }
  }

  const setDb = async (key, val)=>{
    set(key,val)
  }
  const getDb = async (id)=>{
    get(id).then((val) => console.log(val));
  }

  //Vanila JS DB
  const handleGetUsers = async () => {
    const users = await getStoreData(Stores.Users)
    setUsers(users)
  }
  
  
  const handleAddUser = async e => {
    e.preventDefault()
  
    const target = e.target
    const name = target.name.value
    const email = target.email.value
    const id = Date.now()
  
    if (name.trim() === "" || email.trim() === "") {
      alert("Please enter a valid name and email")
      return
    }
  
    try {
      const res = await addData(Stores.Users, { name, email, id })
      console.log(res)
    } catch (err) {
      console.log(err)
    }
  }

  const handleUpdateUser = async user=>{
    try {
      await updateData(Stores.Users, user.id)
      handleGetUsers()
  } catch (err) {
    console.log(err)
  }
  }

  const handleRemoveUser = async id => {
    try {
      await deleteData(Stores.Users, id)
      handleGetUsers()
    } catch (err) {
      console.log(err)
    }
  }
  

  return (
    <main style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>IndexedDB</h1>
      {!isDBReady ? (
        <button onClick={handleInitDB}>Init DB</button>
      ) : (
        <>
          <h2>DB is ready</h2>
          <form onSubmit={setUser}>
            <input type="text" name="name" placeholder="Name" />
            <input type="email" name="email" placeholder="Email" />
            <button type="submit">Add User</button>
          </form>
          <button onClick={handleGetUsers}>Get User</button>
          <button onClick={searchQuery}>Get ABC User</button>
          <button onClick={()=>getDb(1681801923256)}>getDb</button>
        </>
      )} {friends && friends.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {friends && friends.map((friendss) => (
              <tr key={friendss.id}>
                <td>{friendss.name}</td>
                <td>{friendss.email}</td>
                <td>{friendss.id}</td>
                <td>
                  <button onClick={() => deletequery(friendss.id)}>Delete</button>
                </td>
                <td>
                  <button onClick={() => updatequery(friendss.id)}>update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
    </main>
  )
}
