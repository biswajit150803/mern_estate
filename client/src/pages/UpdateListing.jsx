import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react'
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import {useNavigate} from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { set } from 'mongoose';
export default function UpdateListing() {
    const {currentUser}=useSelector((state)=>state.user)
    const navigate=useNavigate()
    const params=useParams()
    const [files,setFiles]=useState([])
    const [formData,setFormData]=useState({
        imageUrls:[],
        name:'',
        description:'',
        address:'',
        type:'',
        parking:false,
        furnished:false,
        offer:false,
        bedrooms:1,
        bathrooms:1,
        regularPrice:50,
        discountPrice:0

    })
    const [imageUploadError,setImageUploadError]=useState(false)
    const [uploading,setUploading]=useState(false)
    const [error,setError]=useState(false);
    const [loading,setLoading]=useState(false);
    console.log(formData)

    useEffect(()=>{
        const fetchListing=async()=>{
            const listingId=params.listingId;
            const res=await fetch(`/api/listing/get/${listingId}`)
            const data=await res.json()
            if(data.success===false){
                console.log(data.message)
            }
            setFormData(data)
        }
        fetchListing()
    },[files])

    const handleImageSubmit=(e)=>{
        if(files.length > 0 && formData.imageUrls.length + files.length < 7){
            setUploading(true)
            setImageUploadError(false)
            const promises=[];
            for(let i=0;i<files.length;i++){
                promises.push(storeImage(files[i]))
            }
            Promise.all(promises).then((data)=>{
                setFormData({...formData,imageUrls:formData.imageUrls.concat(data)})
                setImageUploadError(false)
                setUploading(false)
            }).catch((err)=>{
                setImageUploadError('Image upload failed.Max size allowed is 2mb')
                setUploading(false)
            })            
    }else{
        setImageUploadError('You can only upload 6 images.')
        setUploading(false)
    }
}
const storeImage=async(file)=>{
    return new Promise((resolve,reject)=>{
        const storage=getStorage(app);
        const fileName=new Date().getTime()+file.name;
        const stoageRef=ref(storage,fileName);
        const uploadTask=uploadBytesResumable(stoageRef,file);
        uploadTask.on('state_changed',
        (snapshot)=>{
            const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
            console.log("Uploading is "+progress+"% done")
            // setFilePercent(Math.round(progress))
        },
        (error)=>{
            reject(error)
        },
        ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                resolve(downloadURL)
            })
        });
    })
}
const handleRemoveImage=(index)=>{
    setFormData({...formData,imageUrls:formData.imageUrls.filter((_,i)=>i!==index)})
}

const handleChange=(e)=>{
if(e.target.id==='sale' || e.target.id==='rent'){
    setFormData({...formData,type:e.target.id})
}
if(e.target.id==='parking' || e.target.id==='furnished' || e.target.id==='offer'){
    setFormData({...formData,[e.target.id]:e.target.checked})
}
if(e.target.type==='number' || e.target.type==='text' || e.target.type==='textarea'){
    setFormData({...formData,[e.target.id]:e.target.value})
}
}
const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
        if(formData.imageUrls.length < 1){
            return setError('Please upload at least one image.')    
        }
        if(+formData.regularPrice < +formData.discountPrice){
            return setError('Discount price cannot be greater than regular price.')
        }
        setLoading(true)
        setError(false)
        const res=await fetch(`/api/listing/update/${params.listingId}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                ...formData,
                userRef:currentUser._id,
            })
        })
        const data=await res.json()
        setLoading(false)
        if(data.success===false)
        {
            setError(data.message)
        }
        navigate(`/listing/${data._id}`)
    } catch (error) {
        setError(error.message)
        setLoading(false)
    }
}
  return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Update Listing</h1>
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-5'>
            <div className='flex flex-col gap-4 flex-1'>
            <input type='text' placeholder='Name' className='border p-3 rounded-lg' id="name" maxLength='62' minLength='10' required onChange={handleChange} value={formData.name}/>
            <textarea type='text' placeholder='Description' className='border p-3 rounded-lg' id="description" required onChange={handleChange} value={formData.description}/>
            <input type='text' placeholder='Address' className='border p-3 rounded-lg' id="address" required onChange={handleChange} value={formData.address}/>
            <div className='flex gap-6 flex-wrap'>
                <div className='flex gap-2'>
                    <input className='w-5' type='checkbox' id='sale' onChange={handleChange} checked={formData.type==='sale'}/>
                    <span>Sell</span>
                </div>
                <div className='flex gap-2'>
                    <input className='w-5' type='checkbox' id='rent' onChange={handleChange} checked={formData.type==='rent'}/>
                    <span>Rent</span>
                </div>
                <div className='flex gap-2'>
                    <input className='w-5' type='checkbox' id='parking' onChange={handleChange} checked={formData.parking}/>
                    <span>Parking Spot</span>
                </div>
                <div className='flex gap-2'>
                    <input className='w-5' type='checkbox' id='furnished' onChange={handleChange} checked={formData.furnished}/>
                    <span>Furnished</span>
                </div>
                <div className='flex gap-2'>
                    <input className='w-5' type='checkbox' id='offer' onChange={handleChange} checked={formData.offer}/>
                    <span>Offer</span>
                </div>
            </div>
            <div className='flex flex-wrap gap-6'>
                <div className='flex items-center gap-2'>
                    <input type='number' id='bedrooms' min='1' max='10'  className='border border-gray-300 p-3 rounded-lg' required onChange={handleChange} value={formData.bedrooms}/>
                    <p>Beds</p>
                </div>
                <div className='flex items-center gap-2'>
                    <input type='number' id='bathrooms' min='1' max='10'  className='border border-gray-300 p-3 rounded-lg' required
                    onChange={handleChange} value={formData.bathrooms}/>
                    <p>Baths</p>
                </div>
                <div className='flex items-center gap-2'>
                    <input type='number' id='regularPrice' className='border border-gray-300 p-3 rounded-lg' min='50' max='10000' required onChange={handleChange} value={formData.regularPrice}/>
                    <div className="flex flex-col items-center">
                    <p>Regular Price</p>
                    <span className='text-xs'>($ / month)</span>
                    </div>
                </div>
                {formData.offer &&
                <div className='flex items-center gap-2'>
                    <input type='number' id='discountPrice' className='border border-gray-300 p-3 rounded-lg' required onChange={handleChange} value={formData.discountPrice}/>
                    <div className="flex flex-col items-center">
                    <p>Discount Price</p>
                    <span className='text-xs'>($ / month)</span>
                </div>
                </div>
            }
            </div>
            </div>
            <div className='flex flex-col gap-4 flex-1'>
                <p className='font-semibold'>Images:
                <span className='font-normal text-gray-600 ml-2'>The first image will be cover(max 6)</span>
                </p>
                <div className='flex gap-4'>
                    <input onChange={(e)=>setFiles(e.target.files)} type='file' multiple className='border p-3 rounded w-full border-gray-300 ' id='images' accept='image/*' />
                    <button disabled={uploading} type='button' onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url,index)=>{
                        return(  
                        <div key={index} className='flex justify-between p-3 border items-center'>                      
                        <img key={index} src={url} alt="listing_image" className='w-20 h-20 object-contain rounded-lg'/> 
                        <button type='button' onClick={()=>handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg hover:opacity-95 uppercase'>Delete</button>
                        </div>
                    )                      
                    })

                }
                <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                    {loading ? 'Updating...' : 'Update Listing'}
                </button>
                {error && <p className='text-red-700 text-sm'>{error}</p>}
            </div>
        </form>
    </main>
  )
}
