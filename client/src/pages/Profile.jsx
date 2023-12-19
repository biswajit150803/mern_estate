import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import {useSelector} from 'react-redux';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import {app} from '../firebase';

export default function Profile() {
  const fileRef = useRef(null)
  const {currentUser} = useSelector(state => state.user)
  const [file,setFile]=useState(undefined)
  const [fileUploadError,setFileUploadError]=useState(false)
  const [filePercent,setFilePercent]=useState(0)
  const [formData,setFormData]=useState({})
  console.log(formData)
  console.log(filePercent)
  console.log(fileUploadError)
//------------------Firebase rules--------------------
// rules_version = '2';
// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
//       allow read;
//       allow write:if
//       request.resource.size<2*1024*1024 && 
//       request.resource.contentType.matches('image/.*')
//     }
//   }
// }
//-----------------------------------------------------

useEffect(()=>{
  if(file){
    handleFileUpload(file)
  }
},[file])

const handleFileUpload=(file)=>{
  const storage=getStorage(app);
  const fileName=new Date().getTime()+file.name;
  const stoageRef=ref(storage,fileName);
  const uploadTask=uploadBytesResumable(stoageRef,file);

  uploadTask.on('state_changed',
  (snapshot)=>{
    const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
    console.log("Uploading is "+progress+"% done")
    setFilePercent(Math.round(progress))
  },
  (error)=>{
  setFileUploadError(true)
  },
  ()=>{
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
      setFormData({...formData,avatar:downloadURL})
  })
});
}

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>
      <form action="" className='flex flex-col gap-4'>
        <input onChange={(e)=>{setFile(e.target.files[0])}} type='file' ref={fileRef} hidden accept='image/*'/>
        {/* Using the image element as a reference to the input */}
        <img onClick={()=>{fileRef.current.click()}} src={formData.avatar ||currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePercent}%`}</span>
          ) : filePercent === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input type='text' placeholder='Username' id="username" className='border p-3 rounded-lg' />
        <input type='email' placeholder='Email' id="email" className='border p-3 rounded-lg' />
        <input type='password' placeholder='Password' id='password' className='border p-3 rounded-lg' />
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:op-95'>Update</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
    </div>
  )
}
