// import React, { useState, useRef } from 'react';
// import { CalendarIcon, Store, Package, Receipt, Upload, Plus, Trash2, DollarSign } from 'lucide-react';
// import { useReactToPrint } from 'react-to-print';
// import PharmacyReceipt from './components/PharmacyReceipt';

// const pharmacies = [
//   'صيدلية الشفاء',
//   'صيدلية الدواء',
//   'صيدلية النهدي',
//   'صيدلية الحياة',
//   'صيدلية الرعاية',
//   'صيدلية السلام',
//   'صيدلية الصحة',
//   'صيدلية المدينة',
//   'صيدلية الأمل',
//   'صيدلية الوفاء'
// ];

// const medicines = [
//   { name: 'Panadol', price: 15 },
//   { name: 'Brufen', price: 20 },
//   { name: 'Nexium', price: 45 },
//   { name: 'Lipitor', price: 85 },
//   { name: 'Concor', price: 65 },
//   { name: 'Glucophage', price: 25 },
//   { name: 'Augmentin', price: 40 },
//   { name: 'Amoxil', price: 30 },
//   { name: 'Zithromax', price: 55 },
//   { name: 'Crestor', price: 95 },
//   { name: 'Ventolin', price: 35 },
//   { name: 'Lantus', price: 150 },
//   { name: 'Voltaren', price: 25 },
//   { name: 'Plavix', price: 120 },
//   { name: 'Januvia', price: 110 }
// ];

// interface MedicineOrder {
//   medicine: string;
//   quantity: number;
// }

// interface CollectionProduct {
//   medicine: string;
//   quantity: number;
//   price: number;
//   selected: boolean;
// }

// interface VisitFormData {
//   visitDate: string;
//   pharmacyName: string;
//   medicine: string;
//   draftDistribution: string;
//   order: string;
//   collection: string;
//   introductoryVisit: string;
//   receiptNumber?: string;
//   receiptImage?: File | null;
//   amount?: number;
//   collectionStatus?: 'pending' | 'approved' | 'rejected';
//   medicineOrders: MedicineOrder[];
//   collectionProducts: CollectionProduct[];
// }

// export default function PharmacyVisitForm() {
//   const [formData, setFormData] = useState<VisitFormData>({
//     visitDate: '',
//     pharmacyName: '',
//     medicine: '',
//     draftDistribution: '',
//     order: '',
//     collection: '',
//     introductoryVisit: '',
//     receiptNumber: '',
//     receiptImage: null,
//     amount: 0,
//     collectionStatus: 'pending',
//     medicineOrders: [],
//     collectionProducts: medicines.map(m => ({
//       medicine: m.name,
//       quantity: 0,
//       price: m.price,
//       selected: false
//     }))
//   });

//   const receiptRef = useRef<HTMLDivElement>(null);

//   const handlePrint = useReactToPrint({
//     content: () => receiptRef.current,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
    
//     if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
//       setFormData(prev => ({
//         ...prev,
//         [name]: e.target.files![0]
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: type === 'number' ? parseFloat(value) || 0 : value
//       }));
//     }

//     if (name === 'collection') {
//       if (value === 'نعم') {
//         setFormData(prev => ({
//           ...prev,
//           collectionStatus: 'pending'
//         }));
//       }
//     }
//   };

//   const handleMedicineOrderChange = (index: number, field: keyof MedicineOrder, value: string | number) => {
//     const newMedicineOrders = [...formData.medicineOrders];
//     newMedicineOrders[index] = {
//       ...newMedicineOrders[index],
//       [field]: field === 'quantity' ? Number(value) : value
//     };
//     setFormData(prev => ({
//       ...prev,
//       medicineOrders: newMedicineOrders
//     }));
//   };

//   const handleCollectionProductChange = (index: number, field: 'selected' | 'quantity', value: boolean | number) => {
//     const newProducts = [...formData.collectionProducts];
//     newProducts[index] = {
//       ...newProducts[index],
//       [field]: value
//     };
    
//     const totalAmount = newProducts.reduce((sum, product) => {
//       if (product.selected) {
//         return sum + (product.price * product.quantity);
//       }
//       return sum;
//     }, 0);

//     setFormData(prev => ({
//       ...prev,
//       collectionProducts: newProducts,
//       amount: totalAmount
//     }));
//   };

//   const addMedicineOrder = () => {
//     setFormData(prev => ({
//       ...prev,
//       medicineOrders: [...prev.medicineOrders, { medicine: '', quantity: 0 }]
//     }));
//   };

//   const removeMedicineOrder = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       medicineOrders: prev.medicineOrders.filter((_, i) => i !== index)
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    
//     if (formData.collection === 'نعم') {
//       const selectedProducts = formData.collectionProducts.filter(p => p.selected && p.quantity > 0);
//       collections.push({
//         id: Date.now(),
//         date: formData.visitDate,
//         pharmacy: formData.pharmacyName,
//         amount: formData.amount,
//         receiptNumber: formData.receiptNumber,
//         products: selectedProducts,
//         type: 'collection',
//         status: 'pending'
//       });
//     }

//     if (formData.order === 'نعم') {
//       const groupId = `${formData.pharmacyName}-${formData.visitDate}`;
//       formData.medicineOrders.forEach((order, index) => {
//         collections.push({
//           id: Date.now() + index,
//           date: formData.visitDate,
//           pharmacy: formData.pharmacyName,
//           medicine: order.medicine,
//           quantity: order.quantity,
//           type: 'order',
//           status: 'pending',
//           groupId
//         });
//       });
//     }

//     localStorage.setItem('collections', JSON.stringify(collections));
    
//     alert('تم تسجيل الزيارة بنجاح!');

//     if (formData.collection === 'نعم') {
//       setTimeout(() => handlePrint(), 100);
//     }

//     setFormData({
//       visitDate: '',
//       pharmacyName: '',
//       medicine: '',
//       draftDistribution: '',
//       order: '',
//       collection: '',
//       introductoryVisit: '',
//       receiptNumber: '',
//       receiptImage: null,
//       amount: 0,
//       collectionStatus: 'pending',
//       medicineOrders: [],
//       collectionProducts: medicines.map(m => ({
//         medicine: m.name,
//         quantity: 0,
//         price: m.price,
//         selected: false
//       }))
//     });
//   };

//   return (
//     <div className="py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-card-medical border border-border">
//         <div className="py-6 px-8">
//           <h2 className="text-2xl font-bold text-center text-card-foreground mb-8">
//             نموذج زيارة صيدلية
//           </h2>
          
//           <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
//             <div className="relative">
//               <label className="flex items-center text-gray-700 mb-2">
//                 <CalendarIcon className="w-5 h-5 ml-2" />
//                 تاريخ الزيارة
//               </label>
//               <input
//                 type="date"
//                 name="visitDate"
//                 value={formData.visitDate}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <label className="flex items-center text-muted-foreground mb-2">
//                 <Store className="w-5 h-5 ml-2" />
//                 اسم الصيدلية
//               </label>
//               <select
//                 name="pharmacyName"
//                 value={formData.pharmacyName}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
//                 required
//               >
//                 <option value="">اختر الصيدلية</option>
//                 {pharmacies.map(pharmacy => (
//                   <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-4 gap-4 bg-muted p-4 rounded-lg">
//               <div className="space-y-2">
//                 <label className="block text-muted-foreground text-center mb-2">توزيع درافت</label>
//                 <div className="flex justify-center gap-4">
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="draftDistribution"
//                       value="نعم"
//                       checked={formData.draftDistribution === 'نعم'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     نعم
//                   </label>
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="draftDistribution"
//                       value="لا"
//                       checked={formData.draftDistribution === 'لا'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     لا
//                   </label>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-muted-foreground text-center mb-2">زيارة تعريفية</label>
//                 <div className="flex justify-center gap-4">
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="introductoryVisit"
//                       value="نعم"
//                       checked={formData.introductoryVisit === 'نعم'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     نعم
//                   </label>
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="introductoryVisit"
//                       value="لا"
//                       checked={formData.introductoryVisit === 'لا'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     لا
//                   </label>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-muted-foreground text-center mb-2">طلبية</label>
//                 <div className="flex justify-center gap-4">
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="order"
//                       value="نعم"
//                       checked={formData.order === 'نعم'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     نعم
//                   </label>
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="order"
//                       value="لا"
//                       checked={formData.order === 'لا'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     لا
//                   </label>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-muted-foreground text-center mb-2">تحصيل</label>
//                 <div className="flex justify-center gap-4">
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="collection"
//                       value="نعم"
//                       checked={formData.collection === 'نعم'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     نعم
//                   </label>
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="collection"
//                       value="لا"
//                       checked={formData.collection === 'لا'}
//                       onChange={handleChange}
//                       className="ml-2 accent-primary"
//                     />
//                     لا
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {formData.order === 'نعم' && (
//               <div className="space-y-4 border-t border-border pt-4">
//                 {formData.medicineOrders.map((order, index) => (
//                   <div key={index} className="flex gap-4 items-start">
//                     <div className="flex-1">
//                       <label className="block text-muted-foreground mb-2">الدواء</label>
//                       <select
//                         value={order.medicine}
//                         onChange={(e) => handleMedicineOrderChange(index, 'medicine', e.target.value)}
//                         className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
//                         required
//                       >
//                         <option value="">اختر الدواء</option>
//                         {medicines.map(medicine => (
//                           <option key={medicine.name} value={medicine.name}>{medicine.name}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="flex-1">
//                       <label className="block text-muted-foreground mb-2">الكمية</label>
//                       <input
//                         type="number"
//                         value={order.quantity}
//                         onChange={(e) => handleMedicineOrderChange(index, 'quantity', e.target.value)}
//                         min="1"
//                         className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
//                         required
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeMedicineOrder(index)}
//                       className="mt-8 text-destructive hover:text-destructive/80"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addMedicineOrder}
//                   className="flex items-center gap-2 text-primary hover:text-primary/80"
//                 >
//                   <Plus className="w-5 h-5" />
//                   إضافة دواء آخر
//                 </button>
//               </div>
//             )}

//             {formData.collection === 'نعم' && (
//               <div className="space-y-4 border-t border-border pt-4">
//                 <div className="overflow-hidden rounded-lg border border-border">
//                   <table className="min-w-full divide-y divide-border">
//                     <thead className="bg-muted">
//                       <tr>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">اختيار</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">الدواء</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">السعر</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">الكمية</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">المجموع</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-background divide-y divide-border">
//                       {formData.collectionProducts.map((product, index) => (
//                         <tr key={product.medicine}>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <input
//                               type="checkbox"
//                               checked={product.selected}
//                               onChange={(e) => handleCollectionProductChange(index, 'selected', e.target.checked)}
//                               className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
//                             />
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">{product.medicine}</td>
//                           <td className="px-4 py-3 whitespace-nowrap">{product.price} ريال</td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <input
//                               type="number"
//                               min="0"
//                               value={product.quantity}
//                               onChange={(e) => handleCollectionProductChange(index, 'quantity', parseInt(e.target.value))}
//                               className="w-20 p-1 border border-input rounded bg-background text-foreground"
//                               disabled={!product.selected}
//                             />
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             {product.selected ? product.price * product.quantity : 0} ريال
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex justify-end items-center gap-4 text-lg font-semibold text-card-foreground">
//                   <DollarSign className="w-6 h-6" />
//                   <span>المجموع الكلي: {formData.amount} ريال</span>
//                 </div>

//                 <div className="relative">
//                   <label className="flex items-center text-muted-foreground mb-2">
//                     <Receipt className="w-5 h-5 ml-2" />
//                     رقم الوصل
//                   </label>
//                   <input
//                     type="text"
//                     name="receiptNumber"
//                     value={formData.receiptNumber}
//                     onChange={handleChange}
//                     className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
//                     required
//                   />
//                 </div>

//                 <div className="relative">
//                   <label className="flex items-center text-muted-foreground mb-2">
//                     <Upload className="w-5 h-5 ml-2" />
//                     صورة الوصل
//                   </label>
//                   <input
//                     type="file"
//                     name="receiptImage"
//                     onChange={handleChange}
//                     accept="image/*"
//                     className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition duration-200 font-semibold"
//             >
//               تسجيل الزيارة
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Hidden Receipt for Printing */}
//       <div className="hidden">
//         <div ref={receiptRef}>
//           {formData.collection === 'نعم' && (
//             <PharmacyReceipt
//               pharmacyName={formData.pharmacyName}
//               draftDistribution={formData.draftDistribution}
//               introductoryVisit={formData.introductoryVisit}
//               order={formData.order}
//               collection={formData.collection}
//               medicineOrders={formData.medicineOrders}
//               collectionProducts={formData.collectionProducts.filter(p => p.selected)}
//               totalAmount={formData.amount || 0}
//               receiptNumber={formData.receiptNumber}
//               receiptImage={formData.receiptImage}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }