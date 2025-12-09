import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SamplesForm from "./pages/requests/SamplesForm";
import MarketingForm from "./pages/requests/MarketingForm";
import MarketingRequestForm from "./pages/MarketingRequestForm";
import ProductsManagement from "./pages/ProductsManagement";
import DoctorsManagement from "./pages/DoctorsManagement";
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./pages/UpdateProduct";
import DocumentsManagement from "./pages/DocumentsManagement";
import ProductMessagesUpload from "./pages/ProductMessagesUpload";
import UsersUpload from "./pages/UsersUpload";
import DoctorsUpload from "./pages/DoctorsUpload";
import PharmaciesUpload from "./pages/PharmaciesUpload";
import PharmaciesManagement from "./pages/PharmaciesManagement";
import AddPharmacy from "./pages/AddPharmacy";
import EditPharmacy from "./pages/EditPharmacy";
import SampleRequestForm from "./pages/SampleRequestForm";
import ClientsList from "./pages/ClientsList";
import CreateAdmin from "./pages/CreateAdmin";
import AllAdmins from "./pages/AllAdmins";
import SiteAnalytics from "./pages/SiteAnalytics";
import MarketingActivitiesUpload from "./pages/MarketingActivitiesUpload";
import MarketingActivitiesManagement from "./pages/MarketingActivitiesManagement";
import AddMarketingActivity from "./pages/AddMarketingActivity";
import AddDoctor from "./pages/AddDoctor";
import UpdateDoctor from "./pages/UpdateDoctor";
import ClinicsManagement from "./pages/ClinicsManagement";
import ClinicsAnalytics from "./pages/ClinicsAnalytics";
import Profile from "./pages/Profile";
import MyDataList from "./pages/MyDataList";
import CreateVisit from "./pages/CreateVisit";
import SupervisorSampleRequests from "./pages/SupervisorSampleRequests";
import SupervisorMarketingRequests from "./pages/SupervisorMarketingRequests";
import AdminSampleRequests from "./pages/AdminSampleRequests";
import EmployeesManagement from "./pages/EmployeesManagement";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import PharmacyVisitForm from "./pages/PharmacyVisitForm";
import MoneyCollection from "./pages/MoneyCollection";
import OrdersCollection from "./pages/OrdersCollection";
import SalesClients from "./pages/SalesClients";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrdersCollector from "./pages/OrdersCollector";
import FinancialOrdersCollection from "./pages/FinancialOrdersCollection";
import WorkCalendar from "./pages/WorkdayCalender";
import ProductDetailsView from "./pages/ProductDetailsView";
import ReceiptBooksManager from "./pages/ReceiptBooksManager";
import ReceiptBookDetails from "./pages/ReceiptBookDetails";
import ReportMarketingMedicalRep from "./pages/medical-reports/ReportMarketingMedicalRep";
import SamplesMedicalRep from "./pages/medical-reports/SamplesMedicalRep";
import WorkItemCalendar from "./pages/WorkItemCalender";
import DoctorCard from "./pages/DoctorCard";
import MedicalRepMarketing from "./pages/marketing/MedicalRep";
import Medicalcoah from "./pages/Medicalcoah";
import AnalyticsClincsSupervisor from "./pages/AnalyticsClincsSupervisor";
import MedicalSalesdata from "./pages/MedicalSalesdata";
import PharmacyCard from "./pages/PharmacyCard";
import CoachingReport from "./pages/CoachingReport";
import CoachingView from "./pages/CoachingView";
import NewClinicalReps from "./pages/NewClinicalReps";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="medical-rep-theme">
        <TooltipProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full">
              <SidebarInset>
                <header className="h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-2 px-4" style={{ direction: "rtl" }}>
                    <h1 className="text-lg font-semibold text-foreground">
                      نظام إدارة المندوبين الطبيين
                    </h1>
                  </div>
                  <SidebarTrigger className="mr-4 ml-auto " />
                </header>

                <main className="flex-1 p-6 overflow-auto">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <Navigate to="/profile" replace /> // أو أي مسار تريده
                      }
                    />
                    <Route
                      path="/dashboards"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboards/clinics"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboards/clinics/supervisor"
                      element={
                        <ProtectedRoute>
                          <AnalyticsClincsSupervisor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboards/pharmacies"
                      element={
                        <ProtectedRoute>
                          <PharmacyDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboards/admin"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ADMIN",
                            "SALES SUPERVISOR",
                            "FINANCIAL OFFICER",
                            "FINANCIAL MANAGER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboards/admin/:id"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ADMIN",
                            "SALES SUPERVISOR",
                            "FINANCIAL OFFICER",
                            "FINANCIAL MANAGER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <PharmacyCard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports/clinics"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/visits"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/visits/clinic"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/visits/pharmacy"
                      element={
                        <ProtectedRoute>
                          <PharmacyVisitForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <ClientsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sales-clients"
                      element={
                        <ProtectedRoute requiredRoles={["SALES REP"]}>
                          <SalesClients />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/samples"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/marketing"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/collections"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/collections/financial"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/financial-collector/money-collection"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ADMIN",
                            "FINANCIAL MANAGER",
                            "SALES SUPERVISOR",
                            "FINANCIAL OFFICER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <MoneyCollection />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/financial-collector/orders-collection"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ADMIN",
                            "FINANCIAL MANAGER",
                            "SALES SUPERVISOR",
                            "FINANCIAL OFFICER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <OrdersCollection />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/financial-collector/financial-orders-collection"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ADMIN",
                            "FINANCIAL MANAGER",
                            "manager",
                            "FINANCIAL OFFICER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <FinancialOrdersCollection />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders-collector"
                      element={
                        <ProtectedRoute
                          requiredRoles={[
                            "ORDERS OFFICERS",
                            "ADMIN",
                            "SALES SUPERVISOR",
                            "FINANCIAL MANAGER",
                            "ASSITANT",
                            "GENERAL MANAGER",
                          ]}
                        >
                          <OrdersCollector />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/collections/orders"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/evaluations"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ReceipBooks-manager"
                      element={
                        <ProtectedRoute>
                          <ReceiptBooksManager />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/receipt-books/:id"
                      element={
                        <ProtectedRoute>
                          <ReceiptBookDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/evaluations/representatives"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/work-days"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/lost-orders"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/products"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <ProductsManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/products/add"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <AddProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/products/update/:code"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <UpdateProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/doctors"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <DoctorsManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/doctors-upload"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <DoctorsUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/pharmacies-upload"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <PharmaciesUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/pharmacies"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <PharmaciesManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/pharmacies/add"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <AddPharmacy />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/pharmacies/edit/:id"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <EditPharmacy />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/documents"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <DocumentsManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/product-messages"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <ProductMessagesUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/users-upload"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin"]}>
                          <UsersUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/create-admin"
                      element={
                        <ProtectedRoute requiredRoles={["SYSTEM_ADMIN"]}>
                          <CreateAdmin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/all-admins"
                      element={
                        <ProtectedRoute requiredRoles={["SYSTEM_ADMIN"]}>
                          <AllAdmins />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/site-analytics"
                      element={
                        <ProtectedRoute requiredRoles={["SYSTEM_ADMIN"]}>
                          <SiteAnalytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/marketing-activities-upload"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "SYSTEM_ADMIN"]}>
                          <MarketingActivitiesUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/marketing-activities"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "SYSTEM_ADMIN"]}>
                          <MarketingActivitiesManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/marketing-activities/add"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "SYSTEM_ADMIN"]}>
                          <AddMarketingActivity />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/doctors/add"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <AddDoctor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/data/doctors/update/:id"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <UpdateDoctor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/clinics"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <ClinicsManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/employees"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <EmployeesManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-employee"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <AddEmployee />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-employee/:id"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <EditEmployee />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clinics-analytics"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP"]}>
                          <ClinicsAnalytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics/medical-sales"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP"]}>
                          <MedicalSalesdata />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics/clinics/new"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP"]}>
                          <NewClinicalReps />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-data"
                      element={
                        <ProtectedRoute>
                          <MyDataList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-visit"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP", "medical rep"]}>
                          <CreateVisit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/supervisor/sample-requests"
                      element={
                        <ProtectedRoute requiredRoles={["SUPERVISOR"]}>
                          <SupervisorSampleRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/supervisor/marketing-requests"
                      element={
                        <ProtectedRoute requiredRoles={["SUPERVISOR"]}>
                          <SupervisorMarketingRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/sample-requests"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <AdminSampleRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports/samples/medical-rep"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP"]}>
                          <SamplesMedicalRep />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin", "manager"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/add"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN", "admin"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sample-form"
                      element={
                        <ProtectedRoute>
                          <SamplesForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sample-request"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP", "medical rep"]}>
                          <SampleRequestForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/marketing-form"
                      element={
                        <ProtectedRoute>
                          <MarketingForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports/marketing/medical-rep"
                      element={
                        <ProtectedRoute>
                          <ReportMarketingMedicalRep />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/marketing-request"
                      element={
                        <ProtectedRoute requiredRoles={["MEDICAL REP", "medical rep"]}>
                          <MarketingRequestForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/product-details"
                      element={
                        <ProtectedRoute>
                          <ProductDetailsView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-card/:id"
                      element={
                        <ProtectedRoute>
                          <DoctorCard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Medical-coah"
                      element={
                        <ProtectedRoute>
                          <Medicalcoah />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/CoachingReport"
                      element={
                        <ProtectedRoute>
                          <CoachingReport />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/CoachingReport/:id"
                      element={
                        <ProtectedRoute>
                          <CoachingReport />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/coaching-view/:id"
                      element={
                        <ProtectedRoute>
                          <CoachingView />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </SidebarInset>
              <AppSidebar />
              <MobileNavbar />
            </div>
          </SidebarProvider>
          <Toaster />
          <Sonner />
          <HotToaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: "",
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                direction: "rtl",
                textAlign: "right",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "hsl(var(--primary))",
                  secondary: "hsl(var(--primary-foreground))",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--destructive-foreground))",
                },
              },
              loading: {
                duration: Infinity,
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
