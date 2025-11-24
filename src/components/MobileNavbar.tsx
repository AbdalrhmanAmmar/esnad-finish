import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function MobileNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around border-t border-[#122017]/10 dark:border-[#f6f8f7]/10 bg-[#f6f8f7]/80 dark:bg-[#122017]/80 backdrop-blur-sm px-2 pt-2 pb-4">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${
            isActive('/') || isActive('/dashboards')
              ? 'text-[#38e079]'
              : 'text-[#122017]/60 dark:text-[#f6f8f7]/60'
          }`}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              isActive('/') || isActive('/dashboards')
                ? 'w-16 bg-[#38e079]/20 rounded-full'
                : ''
            }`}
          >
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
          </div>
          <p className="text-xs font-medium">الرئيسية</p>
        </button>

        <button
          onClick={() => navigate('/visits')}
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${
            isActive('/visits') || location.pathname.startsWith('/visits/')
              ? 'text-[#38e079]'
              : 'text-[#122017]/60 dark:text-[#f6f8f7]/60'
          }`}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              isActive('/visits') || location.pathname.startsWith('/visits/')
                ? 'w-16 bg-[#38e079]/20 rounded-full'
                : ''
            }`}
          >
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
            </svg>
          </div>
          <p className="text-xs font-medium">الزيارات</p>
        </button>

        <button
          onClick={() => navigate('/management/data/products')}
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${
            location.pathname.includes('/products')
              ? 'text-[#38e079]'
              : 'text-[#122017]/60 dark:text-[#f6f8f7]/60'
          }`}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              location.pathname.includes('/products')
                ? 'w-16 bg-[#38e079]/20 rounded-full'
                : ''
            }`}
          >
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44L47.66,76,128,32ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78-80,43.79V133.82l80-43.77Z"></path>
            </svg>
          </div>
          <p className="text-xs font-medium">المنتجات</p>
        </button>

        <button
          onClick={() => navigate('/management/data/doctors')}
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${
            location.pathname.includes('/doctors')
              ? 'text-[#38e079]'
              : 'text-[#122017]/60 dark:text-[#f6f8f7]/60'
          }`}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              location.pathname.includes('/doctors')
                ? 'w-16 bg-[#38e079]/20 rounded-full'
                : ''
            }`}
          >
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
            </svg>
          </div>
          <p className="text-xs font-medium">الأطباء</p>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${
            isActive('/profile')
              ? 'text-[#38e079]'
              : 'text-[#122017]/60 dark:text-[#f6f8f7]/60'
          }`}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              isActive('/profile')
                ? 'w-16 bg-[#38e079]/20 rounded-full'
                : ''
            }`}
          >
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M237.94,107.21a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A111.92,111.92,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.63a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"></path>
            </svg>
          </div>
          <p className="text-xs font-medium">الإعدادات</p>
        </button>
      </div>
    </footer>
  );
}