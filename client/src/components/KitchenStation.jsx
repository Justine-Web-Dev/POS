import React from 'react'
import { api } from '../api/api'
import { useState } from 'react'
import { useEffect } from 'react'

function KitchenStation() {
  const [orders,setOrders] = useState([])

  useEffect(()=>{
    const fetchOrders = async () =>{
      try {
        const response = await api.get("/api/users/admin/get-orders/")
        setOrders(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchOrders()
  },[])

  return (
    <div>
      <div>
        <ul>
        {
          orders.map(order =>(
            <li key={order.id}>{order.id}</li>
          ))
        }
        </ul>
      </div>
    </div>
  )
}

export default KitchenStation
