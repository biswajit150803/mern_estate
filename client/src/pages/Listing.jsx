import { set } from 'mongoose'
import React, { useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import {Swiper, SwiperSlide} from 'swiper/react'
import SwiperCore from 'swiper'
import {Navigation} from 'swiper/modules'
import 'swiper/css/bundle'

export default function Listing() {
    SwiperCore.use([Navigation])
    const params = useParams()
    const [listing,setListing]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(false)
    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true)
                setError(false)
            const response = await fetch(`/api/listing/get/${params.listingId}`)
            const data = await response.json()
            console.log(data)
            if (data.success === false) {
                setError(true)
                setLoading(false)
                return;
            }
            setListing(data)
            setLoading(false)
            setError(false)
        }catch (err) {
            setError(true)
            setLoading(false)
        }
    }
    fetchListing()
},[params.listingId]);
  return (
    <main>
        {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
        {error && <p className='text-center my-7 text-2xl'>Something went wrong...</p>}
        {listing && !loading && !error && 
        (
            <>
            <Swiper navigation={true} className='mySwiper'>
                {listing.imageUrls.map((imageUrl,index) => {
                    return (
                        <SwiperSlide key={index}>
                            <div className='h-[500px]' style={{background: `url(${imageUrl}) center no-repeat`,backgroundSize:'cover'}}></div>
                        </SwiperSlide>
                    )
                })}
            </Swiper>
            </>
        )
        }
    </main>
  )
}
