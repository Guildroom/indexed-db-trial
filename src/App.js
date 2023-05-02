import { useCallback, useState } from "react"
import { db } from "./dbDixie/initDb"
import { get, set } from 'idb-keyval';
import { initDB, Stores } from "./dbVanila/iniDb"
import { addData, getStoreData, deleteData, updateData } from "./dbVanila/userDb"
import { useLiveQuery } from "dexie-react-hooks"
import { data } from "./data-generate";

export default function Home() {
  const [isDBReady, setIsDBReady] = useState(false)
  const [users, setUsers] = useState([])

  const handleInitDB = async () => {
    const status = await initDB()
    setIsDBReady(status)
  }

  //dixie DB
  const bulkAdd = async () => {
    try {
      const now = Date.now(); 
      console.log(now)
      db.friends.bulkAdd(data)
      const instant = Date.now();
      console.log(instant)
      console.log('difference : ' + (instant - now));
    } catch (error) {
      console.log(error)
    }
  }
  const addFriend = async (e) => {
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
  const updatequery = async (id) => {
    await db.friends.update(id, { name: "booooo" });
  }
  const deletequery = async (id) => {
    await db.friends.delete(id);
  }
  const searchQuery = async () => {
    const abcFriends = await db.friends
      .where("name")
      .startsWithAnyOfIgnoreCase(["asd"])
      .toArray();

    console.log(abcFriends)
  }
  const searchName = async e => {
    // e.preventDefault()
    // const target = e.target
    const name = e.target.value;
    const now = Date.now(); // Unix timestamp in milliseconds
    console.log(now);
    const abcFriends = await db.friends
      .where("Name")
      .startsWithAnyOfIgnoreCase([name])
      .toArray();

    setUsers(abcFriends)
    console.log(abcFriends.length);
    const instant = Date.now(); // Unix timestamp in milliseconds
    console.log(instant);
    console.log('difference : ' + (instant - now));
  }
  let timer;
  const debounce = (cb, time) => (args) => {
    clearTimeout(timer);
    timer = setTimeout(() => cb(args), time);
  }
  const searchNameFromApi = (e) => {
    searchName(e);
  }
  const inputChangeHandler = useCallback(debounce(searchNameFromApi, 1000), []);

  //IDB-Keyval DB
  const setUser = async (e) => {
    try {
      e.preventDefault()
      
      const target = e.target
      const name = target.name.value
      const email = target.email.value
      const id = Date.now()
      const user = {
        name: name,
        email: email,
        id: id,
      }
      await setDb(id, user);
    } catch (error) {
      console.log(error)
    }
  }
  const setDb = async (key, val) => {
    set(key, val)
  }
  const getDb = async (id) => {
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
  const handleUpdateUser = async user => {
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
          <form onSubmit={addFriend}>
            <input type="text" name="name" placeholder="Name" />
            <input type="email" name="email" placeholder="Email" />
            <button type="submit">Add User</button>
          </form>
          <button onClick={bulkAdd}>add User</button>
          <button onClick={searchQuery}>Get ABC User</button>
          <button onClick={() => getDb(1681801923256)}>getDb</button>
        </>
      )}
      <h2>Serach Name</h2>
      <form>
        <input type="text" name="name" placeholder="Name" onChange={inputChangeHandler} />
        <button type="submit">Find User</button>
      </form>
      {users && users.length > 0 &&
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((users) => (
              <tr key={users.id}>
                <td>{users.name}</td>
                <td>{users.email}</td>
                <td>{users.id}</td>
                <td>
                  <button onClick={() => deletequery(users.id)}>Delete</button>
                </td>
                <td>
                  <button onClick={() => updatequery(users.id)}>update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </main>
  )
}