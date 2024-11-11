import { useParams, useSearchParams } from "react-router-dom"
import Button from "../components/Button"
import HeaderComponent from "../components/HeaderComponent"
import { useState } from "react"
import axios from "axios"

function SendMoney()
{
    const [searchParams] = useSearchParams()
    const id= searchParams.get("id")
    const name = searchParams.get("name")

    const [amount,setAmount] = useState("")

    const transferMoney = async()=>{
        const response = await axios.post("http://localhost:5000/api/v1/account/transfer",{
            amount:amount,
            to:id
        },{
            headers:{
                Authorization:"Bearer "+localStorage.getItem("token")
            }
        })

        console.log(response.data)
    }


    return (
        <div className="h-screen w-screen bg-black bg-opacity-70 flex items-center justify-center">
            <div className="w-[350px] bg-white rounded-sm flex flex-col p-2 px-4">
                <HeaderComponent text="Send Money" />   
                <div className="mt-5 flex space-x-3">
                    <div className="w-10 h-10 text-white bg-black rounded-full text-center">
                        <div className="pt-2">
                            {name[0]}
                        </div>
                    </div>
                    <div className="flex justify-center items-center font-semibold text-xl">
                        {name}
                    </div>
                </div>
                <div className="mt-2 font-semibold">
                    Amount (in Rs)
                </div>
                <input onChange={e=>setAmount(e.target.value)} type="text" className="border-2 border-slate-200 py-1 px-2 rounded-md mt-3 font-semibold " placeholder="Enter amount"/>
                <Button text="Initiate Transfer" onClick={transferMoney}/>
            </div>
        </div>
    )
}

export {SendMoney}