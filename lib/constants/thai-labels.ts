// Thai language labels for the application
export const THAI_LABELS = {
  // Authentication
  login: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  email: 'อีเมล',
  password: 'รหัสผ่าน',
  forgotPassword: 'ลืมรหัสผ่าน',
  resetPassword: 'รีเซ็ตรหัสผ่าน',
  rememberMe: 'จดจำการเข้าสู่ระบบ',
  
  // Common actions
  submit: 'ส่ง',
  cancel: 'ยกเลิก',
  confirm: 'ยืนยัน',
  save: 'บันทึก',
  edit: 'แก้ไข',
  delete: 'ลบ',
  add: 'เพิ่ม',
  create: 'สร้าง',
  update: 'อัปเดต',
  search: 'ค้นหา',
  filter: 'กรอง',
  clear: 'ล้าง',
  reset: 'รีเซ็ต',
  back: 'กลับ',
  next: 'ถัดไป',
  previous: 'ก่อนหน้า',
  close: 'ปิด',
  
  // Navigation
  dashboard: 'แดชบอร์ด',
  inventory: 'รายการสินค้าในสต็อก',
  requisitions: 'เบิกสินค้า',
  createRequisition: 'สร้างใบเบิกสินค้า',
  requisitionHistory: 'ประวัติการเบิกสินค้า',
  admin: 'ผู้ดูแลระบบ',
  approvals: 'อนุมัติการเบิก',
  products: 'จัดการสินค้า',
  stockAdjustments: 'ปรับปรุงสต็อก',
  notices: 'ประกาศ',
  reports: 'รายงาน',
  import: 'นำเข้าข้อมูล',
  
  // Inventory
  productCode: 'รหัสสินค้า',
  productName: 'ชื่อสินค้า',
  description: 'รายละเอียด',
  category: 'หมวดหมู่',
  unit: 'หน่วย',
  quantity: 'จำนวน',
  remaining: 'คงเหลือ',
  minimumStock: 'สต็อกขั้นต่ำ',
  currentStock: 'สต็อกปัจจุบัน',
  inStock: 'มีสินค้า',
  lowStock: 'สินค้าใกล้หมด',
  outOfStock: 'สินค้าหมด',
  
  // Requisitions
  requisition: 'ใบเบิกสินค้า',
  documentNumber: 'เลขที่เอกสาร',
  requestDate: 'วันที่ขอเบิก',
  status: 'สถานะ',
  draft: 'ร่าง',
  pending: 'รอการอนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
  issued: 'จ่ายแล้ว',
  notes: 'หมายเหตุ',
  reason: 'เหตุผล',
  
  // Actions
  approve: 'อนุมัติ',
  reject: 'ปฏิเสธ',
  issue: 'จ่ายสินค้า',
  export: 'ส่งออก',
  print: 'พิมพ์',
  
  // User info
  name: 'ชื่อ',
  department: 'แผนก',
  role: 'บทบาท',
  user: 'ผู้ใช้',
  admin: 'ผู้ดูแลระบบ',
  
  // Dates and time
  date: 'วันที่',
  time: 'เวลา',
  createdAt: 'สร้างเมื่อ',
  updatedAt: 'อัปเดตเมื่อ',
  
  // Messages
  loading: 'กำลังโหลด...',
  noData: 'ไม่มีข้อมูล',
  success: 'สำเร็จ',
  error: 'เกิดข้อผิดพลาด',
  warning: 'คำเตือน',
  info: 'ข้อมูล',
  
  // Validation messages
  required: 'กรุณากรอกข้อมูล',
  invalidEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
  passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
  invalidCredentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  accountDisabled: 'บัญชีผู้ใช้ถูกปิดใช้งาน',
  unauthorized: 'ไม่มีสิทธิ์เข้าถึง',
  forbidden: 'ไม่อนุญาตให้เข้าถึง',
  notFound: 'ไม่พบข้อมูล',
  internalError: 'เกิดข้อผิดพลาดภายในระบบ',
  
  // Theme
  lightTheme: 'โหมดสว่าง',
  darkTheme: 'โหมดมืด',
  toggleTheme: 'เปลี่ยนธีม',
  
  // Placeholders
  enterEmail: 'กรอกอีเมล',
  enterPassword: 'กรอกรหัสผ่าน',
  searchProducts: 'ค้นหาสินค้า...',
  selectCategory: 'เลือกหมวดหมู่',
  enterNotes: 'กรอกหมายเหตุ...',
  
  // Confirmations
  confirmDelete: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?',
  confirmApprove: 'คุณแน่ใจหรือไม่ที่จะอนุมัติการเบิกนี้?',
  confirmReject: 'คุณแน่ใจหรือไม่ที่จะปฏิเสธการเบิกนี้?',
  confirmLogout: 'คุณแน่ใจหรือไม่ที่จะออกจากระบบ?',
  
  // Success messages
  loginSuccess: 'เข้าสู่ระบบสำเร็จ',
  logoutSuccess: 'ออกจากระบบเรียบร้อยแล้ว',
  saveSuccess: 'บันทึกข้อมูลสำเร็จ',
  deleteSuccess: 'ลบข้อมูลสำเร็จ',
  approveSuccess: 'อนุมัติการเบิกสำเร็จ',
  rejectSuccess: 'ปฏิเสธการเบิกสำเร็จ',
  
  // Error messages
  loginError: 'เข้าสู่ระบบไม่สำเร็จ',
  saveError: 'บันทึกข้อมูลไม่สำเร็จ',
  deleteError: 'ลบข้อมูลไม่สำเร็จ',
  loadError: 'โหลดข้อมูลไม่สำเร็จ',
  networkError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
  quantityMustBePositive: 'จำนวนต้องมากกว่า 0',
  insufficientStock: 'จำนวนที่ขอเกินสต็อกที่มีอยู่',
  
  // Forgot password
  forgotPasswordTitle: 'ลืมรหัสผ่าน',
  forgotPasswordDescription: 'กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน',
  sendResetLink: 'ส่งลิงก์รีเซ็ต',
  backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
  resetLinkSent: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้คุณ',
  
  // Company info
  companyName: 'ระบบเบิกสินค้าคลังสินค้า',
  welcomeMessage: 'ยินดีต้อนรับสู่ระบบเบิกสินค้า',
  loginSubtitle: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
} as const;

export type ThaiLabelKey = keyof typeof THAI_LABELS;