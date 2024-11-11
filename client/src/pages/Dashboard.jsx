import { useEffect, useState } from "react"
import { AppBar } from "../components/AppBar"
import { DashboardDetails } from "../components/DashboardDetails"
import { UserEntry } from "../components/UserEntry"
import useDebounce from "../hooks/useDebounce"
import axios from "axios"

function Dashboard() {
  const [filter, setFilter] = useState("")
  const [users, setUsers] = useState([])

  const debouncedValue = useDebounce(filter, 500)

  useEffect(() => {
    if (debouncedValue) {
      axios.get(`http://localhost:5000/api/v1/user/bulk?filter=${debouncedValue}`)
        .then((res) => {
          setUsers(res.data.users);
        });
    } else {
      setUsers([]); // Clear users list if no filter
    }
  }, [debouncedValue]);


  return (
    <div className="flex flex-col w-full">
      <AppBar/>
      <DashboardDetails/>
      <input type="text" className="border-2 border-slate-200 h-10 m-5 rounded-md p-2 font-semibold" placeholder="Search Users..." onChange={(e)=>setFilter(e.target.value)} />
      {users.map((user)=>{
        return (
          <UserEntry key={user._id} id={user._id} firstName={user.firstName} lastName={user.lastName} />
        )
      })}
    </div>
  )
}

export {Dashboard}