export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'User';
  createdDate: string;
}

export interface PolicyMember {
  id: string;
  name: string;
  age: string;
  dob: string;
  relation: 'Employee' | 'Spouse' | 'Child';
}

export interface PolicyDocument {
  id: number;
  policyNumber: string;
  policyStartDate: string;
  policyEndDate: string;
  corporateName: string;
  premiumAmount: number;
  actualInsurerPart: string;
  advancePremium: number;
  pendingPremium: number;
  modeOfPremium: 'Cash' | 'Cheque' | 'Online' | 'NEFT';
  premiumDate: string;
  profitAmount: string;
  profitEachMember: string;
  insuranceCompanyName: string;
  tpaName: string;
  policyType: 'GMC' | 'Group Health';
  members: PolicyMember[];
  address: string;
  mobileNo: string;
  emailId: string;
  brokerAgentName: string;
  panFileName?: string;
  aadhaarFileName?: string;
  sumInsured: string;
  sumInsuredUtilised: string;
  uhid: string;
  ailmentCapping: string;
  uploadedBy: number;
  createdDate: string;
}

export interface Claim {
  claimId: number;
  userId: number;
  claimNumber: string;
  policyNumber: string;
  employeeName: string;
  hospitalName: string;
  hospitalAddress: string;
  dateOfAdmission: string;
  dateOfDischarge: string;
  diagnosis: string;
  treatmentType: 'Surgical' | 'Medical';
  claimAmount: number;
  mouDiscount: number;
  approvedAmount: number;
  disallowedAmount: number;
  disallowedReason: string;
  claimType: 'Cashless' | 'Reimbursement';
  status: 'Pending' | 'Approved' | 'Rejected';
  inwardDate: string;
  alSanctionDate: string;
  alSanctionAmount: number;
  alNetSanctionAmount: number;
  pendingStatus: {
    hospital: boolean;
    insurer: boolean;
    documents: boolean;
    investigation: boolean;
    payment: boolean;
  };
  averageClaimSize: number;
  paymentDate: string;
  queryReminderDate: string;
  utrDetails: string;
  bankDetails: {
    accountNo: string;
    ifsc: string;
    name: string;
  };
  focNonFoc: 'FOC' | 'Non-FOC';
  createdDate: string;
  documents?: ClaimDocument[];
}

export interface ClaimDocument {
  id: number;
  claimId: number;
  filePath: string;
  fileName: string;
  uploadedDate: string;
}
