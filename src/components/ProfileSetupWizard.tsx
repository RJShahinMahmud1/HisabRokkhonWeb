import React, { useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../store';

export function ProfileSetupWizard({ onComplete }: { onComplete: () => void }) {
  const { user, updateProfile } = useAppStore();
  const [step, setStep] = useState(1);
  
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [education, setEducation] = useState(user?.education || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [hobbies, setHobbies] = useState(user?.hobbies || '');

  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
             }
          } else {
             if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
             }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: any, size: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, size, size);
      setter(compressed);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    await updateProfile({
        avatarUrl,
        coverUrl,
        designation,
        bio,
        location,
        education,
        dob,
        hobbies,
        profileSetupCompleted: true
    });
    onComplete();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen p-6 md:pt-12">
       <div className="mb-8">
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">প্রোফাইল সেটআপ</h1>
           <div className="flex gap-1">
             {[1,2,3,4,5].map(i => (
                 <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
             ))}
           </div>
       </div>

       {step === 1 && (
           <div className="space-y-6">
               <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">কভার ফটো</h2>
               <div className="relative h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                  {coverUrl ? (
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-center text-slate-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <span className="text-sm">কভার ফটো আপলোড করুন</span>
                      </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCoverUrl, 800)} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
               <div className="flex gap-3 pt-6">
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium">এড়িয়ে যান (Skip)</button>
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">পরবর্তী ধাপ</button>
               </div>
           </div>
       )}

       {step === 2 && (
           <div className="space-y-6">
               <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">প্রোফাইল ছবি</h2>
               <div className="flex justify-center">
                   <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          <Camera className="w-8 h-8 text-slate-400" />
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setAvatarUrl, 400)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
               </div>
               <div className="flex gap-3 pt-6">
                   <button onClick={handleBack} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">পিছনে</button>
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium">এড়িয়ে যান</button>
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">পরবর্তী ধাপ</button>
               </div>
           </div>
       )}

       {step === 3 && (
           <div className="space-y-4">
               <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">পদবি এবং বায়ো</h2>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">আপনার পদবি/পেশা</label>
                   <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="যেমন: Software Engineer" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
               </div>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">ছোট বর্ণনা (Bio)</label>
                   <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="আপনার সম্পর্কে কিছু লিখুন..." rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
               </div>
               <div className="flex gap-3 pt-4">
                   <button onClick={handleBack} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">পিছনে</button>
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">পরবর্তী ধাপ</button>
               </div>
           </div>
       )}

       {step === 4 && (
           <div className="space-y-4">
               <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">ঠিকানা ও শিক্ষা</h2>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">বর্তমান অবস্থান (Location)</label>
                   <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="যেমন: ঢাকা, বাংলাদেশ" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
               </div>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">শিক্ষাগত যোগ্যতা</label>
                   <input type="text" value={education} onChange={e => setEducation(e.target.value)} placeholder="যেমন: B.Sc in CSE" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
               </div>
               <div className="flex gap-3 pt-4">
                   <button onClick={handleBack} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">পিছনে</button>
                   <button onClick={handleNext} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">পরবর্তী ধাপ</button>
               </div>
           </div>
       )}

       {step === 5 && (
           <div className="space-y-4">
               <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">শখ ও জন্মতারিখ</h2>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">जन्मতারিখ (DOB)</label>
                   <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
               </div>
               <div>
                   <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">আপনার শখ (Hobbies)</label>
                   <input type="text" value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="যেমন: বই পড়া, ভ্রমণ" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
               </div>
               <div className="flex gap-3 pt-4">
                   <button onClick={handleBack} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">পিছনে</button>
                   <button onClick={handleFinish} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">শেষ করুন</button>
               </div>
           </div>
       )}
    </div>
  );
}
