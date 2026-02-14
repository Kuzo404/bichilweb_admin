'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import { Input, Textarea, Button } from '@/components/FormElements';
import { PlusIcon, TrashIcon, PencilIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import { axiosInstance } from '@/lib/axios';

interface Translation {
  id?: number;
  language: number;
  language_code?: string;
  language_name?: string;
  name: string;
  desc: string;
}

interface JobTranslation {
  id?: number;
  language: number;
  language_code?: string;
  language_name?: string;
  title: string;
  department: string;
  desc: string;
  requirements: string;
}

interface JobAPI {
  id?: number;
  type: number;
  location: string;
  deadline: string;
  status: number;
  date?: string;
  translations: JobTranslation[];
}

interface Job {
  id: string;
  title: string;
  title_en?: string;
  department: string;
  department_en?: string;
  type: string;
  location: string;
  description: string;
  description_en?: string;
  requirements?: string;
  requirements_en?: string;
  deadline: string;
  status: string;
}

interface Policy {
  id?: number;
  key: string;
  visual_type: string;
  visual_preset: string;
  font_color: string;
  bg_color: string;
  fontsize: string;
  active: boolean;
  created_at?: string | null;
  translations: Translation[];
  gradient?: string;
  glowColor?: string;
  iconBg?: string;
  icon?: string;
}

const defaultPolicies: Record<string, Policy> = {
  equal: {
    key: 'equal',
    visual_type: 'card',
    visual_preset: 'modern',
    font_color: '#334155',
    bg_color: '#FFFFFF',
    fontsize: '16',
    active: true,
    translations: [
      { language: 1, name: 'Equal Opportunity', desc: 'We provide equal opportunities and fair treatment to all employees regardless of gender, age, ethnicity, or religion.' },
      { language: 2, name: 'Тэгш боломж', desc: 'Бүх ажилтанд ижил боломж, шударга хандлагыг баримтална. Хүйс, нас, үндэс угсаа, шашин шүтлэгээс үл хамааран бүх ажилтныг тэгш эрхтэйгээр хүлээн зөвшөөрдөг.' },
    ],
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    icon: 'equal',
  },
  training: {
    key: 'training',
    visual_type: 'card',
    visual_preset: 'modern',
    font_color: '#334155',
    bg_color: '#FFFFFF',
    fontsize: '16',
    active: true,
    translations: [
      { language: 1, name: 'Training', desc: 'Regular professional development training, leadership programs, language courses, and digital technology training.' },
      { language: 2, name: 'Сургалт', desc: 'Мэргэжлийн ур чадварыг дээшлүүлэх сургалтууд, удирдлагын хөгжлийн хөтөлбөр, гадаад хэлний сургалт, дижитал технологийн сургалтуудыг тогтмол зохион байгуулна.' },
    ],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    iconBg: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    icon: 'training',
  },
  benefits: {
    key: 'benefits',
    visual_type: 'card',
    visual_preset: 'modern',
    font_color: '#334155',
    bg_color: '#FFFFFF',
    fontsize: '16',
    active: true,
    translations: [
      { language: 1, name: 'Benefits', desc: 'Performance bonuses, employee awards, goal-based incentives, and innovation initiative rewards.' },
      { language: 2, name: 'Урамшуулал', desc: 'Гүйцэтгэлийн урамшуулал, шилдэг ажилтны шагнал, зорилгын урамшуулал, инноваци санаачилгын шагнал зэргийг олгодог.' },
    ],
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    icon: 'benefits',
  },
  health: {
    key: 'health',
    visual_type: 'card',
    visual_preset: 'modern',
    font_color: '#334155',
    bg_color: '#FFFFFF',
    fontsize: '16',
    active: true,
    translations: [
      { language: 1, name: 'Health', desc: 'Comprehensive health insurance, annual health checkups, gym membership, and psychological support.' },
      { language: 2, name: 'Эрүүл мэнд', desc: 'Бүрэн хэмжээний эрүүл мэндийн даатгал, жил бүрийн эрүүл мэндийн үзлэг, спорт заалны гишүүнчлэл, сэтгэл зүйн дэмжлэг үзүүлнэ.' },
    ],
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    iconBg: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    icon: 'health',
  },
};

const POLICY_ICONS: Record<string, React.ReactNode> = {
  equal: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  training: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
  benefits: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  health: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>),
  insurance: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>),
  retirement: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  vacation: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  flexible: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  childcare: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  wellness: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-9-1a9 9 0 0118 0 9 9 0 01-18 0z" /></svg>),
  transport: (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
};

const transformAPIToJob = (apiJob: JobAPI): Job => {
  const enTranslation = apiJob.translations.find(t => t.language === 1);
  const mnTranslation = apiJob.translations.find(t => t.language === 2);
  
  const typeMap: Record<number, string> = { 1: 'Бүтэн цагийн', 2: 'Хагас цагийн', 3: 'Гэрээт' };
  const statusMap: Record<number, string> = { 1: 'active', 2: 'closed' };
  
  return {
    id: String(apiJob.id || ''),
    type: typeMap[apiJob.type] || 'Бүтэн цагийн',
    location: apiJob.location,
    deadline: apiJob.deadline,
    status: statusMap[apiJob.status] || 'active',
    title: mnTranslation?.title || '',
    title_en: enTranslation?.title || '',
    department: mnTranslation?.department || '',
    department_en: enTranslation?.department || '',
    description: mnTranslation?.desc || '',
    description_en: enTranslation?.desc || '',
    requirements: mnTranslation?.requirements || '',
    requirements_en: enTranslation?.requirements || '',
  };
};

const transformJobToAPI = (job: Job): Omit<JobAPI, 'id' | 'date'> => {
  const typeMap: Record<string, number> = { 'Бүтэн цагийн': 1, 'Хагас цагийн': 2, 'Гэрээт': 3 };
  const statusMap: Record<string, number> = { 'active': 1, 'closed': 2 };
  
  return {
    type: typeMap[job.type] || 1,
    location: job.location,
    deadline: job.deadline,
    status: statusMap[job.status] || 1,
    translations: [
      { language: 1, title: job.title_en || job.title, department: job.department_en || job.department, desc: job.description_en || job.description, requirements: job.requirements_en || job.requirements || '' },
      { language: 2, title: job.title, department: job.department, desc: job.description, requirements: job.requirements || '' },
    ],
  };
};

export default function HRPage() {
  const { language, setLanguage, t } = useLanguage();
  const [policies, setPolicies] = useState<Record<string, Policy>>(defaultPolicies);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const trans = {
    title: t('Хүний нөөц удирдлага', 'HR Management'),
    addPolicy: t('Шинэ бодлого нэмэх', 'Add New Policy'),
    addJob: t('Шинэ зар нэмэх', 'Add New Job'),
    jobListings: t('Ажлын байрны зар', 'Job Listings'),
    policyListings: t('HR Бодлого', 'HR Policies'),
    save: t('Хадгалах', 'Save'),
    cancel: t('Цуцлах', 'Cancel'),
    edit: t('Засах', 'Edit'),
    delete: t('Устгах', 'Delete'),
    deadline: t('Хүлээн авах хугацаа', 'Deadline'),
    status: t('Статус', 'Status'),
    active: t('Идэвхтэй', 'Active'),
    closed: t('Хаагдсан', 'Closed'),
    type: t('Төрөл', 'Type'),
    location: t('Байршил', 'Location'),
  };

  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [modalMode, setModalMode] = useState<'job' | 'policy'>('job');

  const [jobFormData, setJobFormData] = useState<Job>({
    id: '', title: '', title_en: '', department: '', department_en: '', type: 'Бүтэн цагийн',
    location: '', description: '', description_en: '', requirements: '', requirements_en: '', deadline: '', status: 'active',
  });

  const [policyFormData, setPolicyFormData] = useState<Policy>({
    key: '', visual_type: 'card', visual_preset: 'modern', font_color: '#334155', bg_color: '#FFFFFF', fontsize: '16', active: true,
    translations: [{ language: 1, name: '', desc: '' }, { language: 2, name: '', desc: '' }],
    gradient: 'from-blue-500 via-indigo-500 to-purple-500', glowColor: 'rgba(99, 102, 241, 0.4)', iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: 'equal',
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hrpolicy/');
      const policiesData: Record<string, Policy> = {};
      response.data.forEach((policy: Policy) => {
        const iconMapping: Record<string, string> = { 'm': 'equal', 'modern': 'equal', 'training': 'training', 't': 'training', 'benefits': 'benefits', 'b': 'benefits', 'health': 'health', 'h': 'health', 'insurance': 'insurance', 'i': 'insurance', 'retirement': 'retirement', 'r': 'retirement', 'vacation': 'vacation', 'v': 'vacation', 'flexible': 'flexible', 'f': 'flexible', 'childcare': 'childcare', 'c': 'childcare', 'wellness': 'wellness', 'w': 'wellness', 'transport': 'transport' };
        const icon = iconMapping[policy.visual_preset?.toLowerCase()] || policy.key;
        const gradientMapping: Record<string, string> = { 'equal': 'from-blue-500 via-indigo-500 to-purple-500', 'training': 'from-emerald-500 via-teal-500 to-cyan-500', 'benefits': 'from-amber-500 via-orange-500 to-rose-500', 'health': 'from-rose-500 via-pink-500 to-fuchsia-500', 'insurance': 'from-violet-500 via-purple-500 to-indigo-500', 'retirement': 'from-cyan-500 via-blue-500 to-indigo-500', 'vacation': 'from-lime-500 via-green-500 to-emerald-500', 'flexible': 'from-yellow-500 via-orange-500 to-red-500', 'childcare': 'from-pink-500 via-rose-500 to-red-500', 'wellness': 'from-teal-500 via-cyan-500 to-blue-500', 'transport': 'from-orange-500 via-amber-500 to-yellow-500' };
        const glowMapping: Record<string, string> = { 'equal': 'rgba(99, 102, 241, 0.4)', 'training': 'rgba(20, 184, 166, 0.4)', 'benefits': 'rgba(249, 115, 22, 0.4)', 'health': 'rgba(236, 72, 153, 0.4)', 'insurance': 'rgba(139, 92, 246, 0.4)', 'retirement': 'rgba(34, 211, 238, 0.4)', 'vacation': 'rgba(34, 197, 94, 0.4)', 'flexible': 'rgba(234, 179, 8, 0.4)', 'childcare': 'rgba(244, 63, 94, 0.4)', 'wellness': 'rgba(20, 184, 166, 0.4)', 'transport': 'rgba(251, 146, 60, 0.4)' };
        const iconBgMapping: Record<string, string> = { 'equal': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 'training': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', 'benefits': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', 'health': 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', 'insurance': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 'retirement': 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', 'vacation': 'linear-gradient(135deg, #84cc16 0%, #22c55e 100%)', 'flexible': 'linear-gradient(135deg, #eab308 0%, #f97316 100%)', 'childcare': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', 'wellness': 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', 'transport': 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)' };
        policiesData[policy.key] = { ...policy, gradient: gradientMapping[icon] || 'from-blue-500 via-indigo-500 to-purple-500', glowColor: glowMapping[icon] || 'rgba(99, 102, 241, 0.4)', iconBg: iconBgMapping[icon] || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: icon };
      });
      setPolicies(policiesData);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies(defaultPolicies);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/jobs/');
      const transformedJobs = response.data.map(transformAPIToJob);
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert(t('Ажлын байр ачаалахад алдаа гарлаа', 'Error loading jobs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs()
    fetchPolicies();
  }, []);

  const getPolicyName = (policy: Policy): string => {
    const translation = policy.translations.find((t) => t.language === (language === 'en' ? 1 : 2));
    return translation?.name || '';
  };

  const getPolicyDesc = (policy: Policy): string => {
    const translation = policy.translations.find((t) => t.language === (language === 'en' ? 1 : 2));
    return translation?.desc || '';
  };

  const createPolicy = async (policyData: Policy) => {
    try {
      setLoading(true);
      const { gradient, glowColor, iconBg, icon, ...backendData } = policyData;
      const response = await axiosInstance.post('/hrpolicy/', backendData);
      const newPolicy = { ...response.data, gradient: policyData.gradient, glowColor: policyData.glowColor, iconBg: policyData.iconBg, icon: policyData.icon };
      setPolicies((prev) => ({ ...prev, [newPolicy.key]: newPolicy }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return response.data;
    } catch (error) {
      console.error('Error creating policy:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (policyData: Policy) => {
    try {
      setLoading(true);
      const { gradient, glowColor, iconBg, icon, ...backendData } = policyData;
      const response = await axiosInstance.put(`/hrpolicy/${policyData.id}/`, backendData);
      const updatedPolicy = { ...response.data, gradient: policyData.gradient, glowColor: policyData.glowColor, iconBg: policyData.iconBg, icon: policyData.icon };
      setPolicies((prev) => ({ ...prev, [updatedPolicy.key]: updatedPolicy }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return response.data;
    } catch (error) {
      console.error('Error updating policy:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async (policyId: number, policyKey: string) => {
    if (!confirm(t('Устгах уу?', 'Delete this policy?'))) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/hrpolicy/${policyId}/`);
      setPolicies((prev) => {
        const newPolicies = { ...prev };
        delete newPolicies[policyKey];
        return newPolicies;
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Job) => {
    try {
      setLoading(true);
      const apiData = transformJobToAPI(jobData);
      const response = await axiosInstance.post('/jobs/', apiData);
      const newJob = transformAPIToJob(response.data);
      setJobs((prev) => [...prev, newJob]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchJobs();

      return response.data;

    } catch (error) {
      console.error('Error creating job:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobData: Job) => {
    try {
      setLoading(true);
      const apiData = transformJobToAPI(jobData);
      const response = await axiosInstance.put(`/jobs/${jobData.id}/`, apiData);
      const updatedJob = transformAPIToJob(response.data);
      setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm(t('Устгах уу?', 'Delete this job?'))) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/jobs/${jobId}/`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(t('Алдаа гарлаа!', 'Error occurred!'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPolicyModal = (policy?: Policy) => {
    setModalMode('policy');
    if (policy) {
      setEditingPolicy(policy);
      setPolicyFormData(policy);
    } else {
      setEditingPolicy(null);
      setPolicyFormData({ key: '', visual_type: 'card', visual_preset: 'modern', font_color: '#334155', bg_color: '#FFFFFF', fontsize: '16', active: true, translations: [{ language: 1, name: '', desc: '' }, { language: 2, name: '', desc: '' }], gradient: 'from-blue-500 via-indigo-500 to-purple-500', glowColor: 'rgba(99, 102, 241, 0.4)', iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', icon: 'equal' });
    }
    setModalOpen(true);
  };

  const handleSavePolicy = async () => {
    try {
      if (editingPolicy && editingPolicy.id) {
        await updatePolicy({ ...policyFormData, id: editingPolicy.id });
      } else {
        await createPolicy(policyFormData);
      }
      setModalOpen(false);
    } catch (error) {}
  };

  const handleDeletePolicy = async (key: string) => {
    const policy = policies[key];
    if (policy && policy.id) {
      await deletePolicy(policy.id, key);
    }
  };

  const handleOpenJobModal = (job?: Job) => {
    setModalMode('job');
    if (job) {
      setEditingJob(job);
      setJobFormData(job);
    } else {
      setEditingJob(null);
      setJobFormData({ id: '', title: '', title_en: '', department: '', department_en: '', type: 'Бүтэн цагийн', location: '', description: '', description_en: '', requirements: '', requirements_en: '', deadline: '', status: 'active' });
    }
    setModalOpen(true);
  };

  const handleSaveJob = async () => {
    try {
      if (editingJob && editingJob.id) {
        await updateJob(jobFormData);
      } else {
        await createJob(jobFormData);
      }
      setModalOpen(false);
    } catch (error) {}
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
  };

  const renderPolicyButton = (key: string) => {
    const policy = policies[key];
    if (!policy || !policy.active) return null;
    const isActive = activePolicy === key;
    const glowColor = policy.glowColor || 'rgba(99, 102, 241, 0.4)';
    const iconBg = policy.iconBg || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    const policyName = getPolicyName(policy);
    return (
      <button key={key} onClick={() => setActivePolicy(isActive ? null : key)} className="group relative" aria-expanded={isActive}>
        <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${isActive ? 'opacity-60 scale-110' : 'opacity-0 group-hover:opacity-40 group-hover:scale-105'}`} style={{ background: glowColor }} />
        <div className={`relative p-4 rounded-lg text-left transition-all duration-300 border ${isActive ? 'border-slate-300 bg-white shadow-md scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0`} style={{ background: iconBg }}>{POLICY_ICONS[policy.icon || key]}</div>
              <div className="font-medium text-slate-700 text-sm">{policyName}</div>
            </div>
          </div>
          <div className={`absolute bottom-3 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r ${policy.gradient} transition-all duration-500 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'}`} style={{ transformOrigin: 'left' }} />
        </div>
      </button>
    );
  };

  return (
    <AdminLayout title={trans.title}>
      <div className="min-h-screen bg-slate-50 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-slate-200/40 via-slate-200/20 to-slate-100/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-slate-200/30 via-slate-200/15 to-slate-100/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative px-3 sm:px-4 py-4 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-900">{trans.title}</h1>
              <div className="bg-slate-100 rounded-lg p-1.5 border border-slate-300 shadow-sm w-fit">
                <div className="flex gap-1">
                  <button onClick={() => setLanguage('mn')} className={`px-4 py-2 rounded font-semibold text-sm transition-all ${language === 'mn' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}>🇲🇳</button>
                  <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded font-semibold text-sm transition-all ${language === 'en' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}>🇺🇸 EN</button>
                </div>
              </div>
            </div>
            {saveSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-900">{t('Амжилттай хадгалагдлаа!', 'Saved successfully!')}</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">{t('Өөрчлөлтүүд хадгалагдсан.', 'Changes saved.')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{trans.policyListings}</h2>
              <Button onClick={() => handleOpenPolicyModal()} variant="primary"><PlusIcon className="h-5 w-5 mr-2" />{trans.addPolicy}</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 text-sm text-slate-700">{Object.keys(policies).map(renderPolicyButton)}</div>
          </div>

          {activePolicy && policies[activePolicy] && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: policies[activePolicy].iconBg || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>{POLICY_ICONS[policies[activePolicy].icon || activePolicy]}</div>
                  <h3 className="text-lg font-semibold text-slate-900">{getPolicyName(policies[activePolicy])}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenPolicyModal(policies[activePolicy])} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><PencilIcon className="h-4 w-4" /></button>
                  <button onClick={() => handleDeletePolicy(activePolicy)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap" style={{ color: policies[activePolicy].font_color || '#334155', fontSize: `${policies[activePolicy].fontsize || 16}px` }}>{getPolicyDesc(policies[activePolicy])}</p>
            </div>
          )}

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{trans.jobListings}</h2>
              <Button onClick={() => handleOpenJobModal()} variant="primary"><PlusIcon className="h-5 w-5 mr-2" />{trans.addJob}</Button>
            </div>
            {jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job: Job, index: number) => (
                  <div key={job.id} className="rounded-xl border border-slate-200 bg-white">
                    <div className="p-3 sm:p-5">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' }}><BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 text-white text-[10px] sm:text-xs font-bold shrink-0">{index + 1}</span>
                              <h3 className="text-sm sm:text-xl font-semibold text-slate-900 truncate">{language === 'en' ? job.title_en || job.title : job.title}</h3>
                              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status === 'active' ? trans.active : trans.closed}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-10 sm:ml-13">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/80 text-xs sm:text-sm rounded-full text-slate-600 border border-slate-200/50">{language === 'en' ? job.department_en || job.department : job.department}</span>
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/80 text-xs sm:text-sm rounded-full text-slate-600 border border-slate-200/50">{job.type}</span>
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/80 text-xs sm:text-sm rounded-full text-slate-600 border border-slate-200/50">{job.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-1.5 shrink-0">
                          <button onClick={() => handleOpenJobModal(job)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><PencilIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-200">
                        <span className="text-xs sm:text-sm text-slate-600">{trans.deadline}: {job.deadline}</span>
                      </div>
                    </div>
                    <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-0 border-t border-slate-200 bg-slate-50">
                      <div className="pt-3 sm:pt-5 space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{t('Ажлын тайлбар', 'Job Description')}</h4>
                          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{language === 'en' ? job.description_en || job.description : job.description}</p>
                        </div>
                        {(language === 'en' ? job.requirements_en : job.requirements) && (
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                            <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{t('Шаардлага', 'Requirements')}</h4>
                            <div className="text-slate-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">{language === 'en' ? job.requirements_en : job.requirements}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {modalOpen && (
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'policy' ? editingPolicy ? t('Бодлого засах', 'Edit Policy') : t('Шинэ бодлого нэмэх', 'Add New Policy') : editingJob ? t('Зар засах', 'Edit Job Listing') : t('Шинэ зар нэмэх', 'Add New Job')}>
              {modalMode === 'job' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Нэр (Монгол)', 'Name (Mongolian)')}</label><Input value={jobFormData.title} onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })} placeholder={t('Зээлийн мэргэжилтэн', 'Loan Specialist')} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Нэр (English)', 'Name (English)')}</label><Input value={jobFormData.title_en || ''} onChange={(e) => setJobFormData({ ...jobFormData, title_en: e.target.value })} placeholder="Loan Specialist" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Хэлтэс (Монгол)', 'Department (Mongolian)')}</label><Input value={jobFormData.department} onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Хэлтэс (English)', 'Department (English)')}</label><Input value={jobFormData.department_en || ''} onChange={(e) => setJobFormData({ ...jobFormData, department_en: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{trans.type}</label><select value={jobFormData.type} onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option>Бүтэн цагийн</option><option>Хагас цагийн</option><option>Гэрээт</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{trans.location}</label><Input value={jobFormData.location} onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })} /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Тайлбар (Монгол)', 'Description (Mongolian)')}</label><Textarea value={jobFormData.description} onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })} rows={3} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Description (English)', 'Description (English)')}</label><Textarea value={jobFormData.description_en || ''} onChange={(e) => setJobFormData({ ...jobFormData, description_en: e.target.value })} rows={3} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Шаардлага (Монгол)', 'Requirements (Mongolian)')}</label><Textarea value={jobFormData.requirements || ''} onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })} rows={3} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Requirements (English)', 'Requirements (English)')}</label><Textarea value={jobFormData.requirements_en || ''} onChange={(e) => setJobFormData({ ...jobFormData, requirements_en: e.target.value })} rows={3} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label={trans.deadline} type="date" value={jobFormData.deadline} onChange={(e) => setJobFormData({ ...jobFormData, deadline: e.target.value })} />
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{trans.status}</label><select value={jobFormData.status} onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="active">{trans.active}</option><option value="closed">{trans.closed}</option></select></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button onClick={() => setModalOpen(false)} variant="secondary">{trans.cancel}</Button>
                    <Button onClick={handleSaveJob} variant="primary" disabled={loading}>{loading ? t('Хадгалж байна...', 'Saving...') : trans.save}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {/* FULL POLICY FORM - KEEPING ORIGINAL */}
                  <Input label={t('Key (англи үсэг)', 'Key')} value={policyFormData.key} onChange={(e) => setPolicyFormData({ ...policyFormData, key: e.target.value.toLowerCase().replace(/[^a-z]/g, '') })} disabled={!!editingPolicy} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Нэр (English)', 'Name (English)')}</label><Input value={policyFormData.translations[0]?.name || ''} onChange={(e) => { const n = [...policyFormData.translations]; n[0] = { ...n[0], language: 1, name: e.target.value }; setPolicyFormData({ ...policyFormData, translations: n }); }} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Нэр (Монгол)', 'Name (Mongolian)')}</label><Input value={policyFormData.translations[1]?.name || ''} onChange={(e) => { const n = [...policyFormData.translations]; n[1] = { ...n[1], language: 2, name: e.target.value }; setPolicyFormData({ ...policyFormData, translations: n }); }} /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Тайлбар (English)', 'Description (English)')}</label><Textarea value={policyFormData.translations[0]?.desc || ''} onChange={(e) => { const n = [...policyFormData.translations]; n[0] = { ...n[0], language: 1, desc: e.target.value }; setPolicyFormData({ ...policyFormData, translations: n }); }} rows={3} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('Тайлбар (Монгол)', 'Description (Mongolian)')}</label><Textarea value={policyFormData.translations[1]?.desc || ''} onChange={(e) => { const n = [...policyFormData.translations]; n[1] = { ...n[1], language: 2, desc: e.target.value }; setPolicyFormData({ ...policyFormData, translations: n }); }} rows={3} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Харагдах байдал', 'Visual Type')}</label><select value={policyFormData.visual_type} onChange={(e) => setPolicyFormData({ ...policyFormData, visual_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="card">Card</option><option value="banner">Banner</option><option value="list">List</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('Загвар', 'Preset')}</label><select value={policyFormData.visual_preset} onChange={(e) => setPolicyFormData({ ...policyFormData, visual_preset: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="m">m - Equal</option><option value="t">t - Training</option><option value="b">b - Benefits</option><option value="h">h - Health</option><option value="i">i - Insurance</option></select></div>
                  </div>
                  <Input label={t('Текстийн өнгө', 'Text Color')} type="color" value={policyFormData.font_color} onChange={(e) => setPolicyFormData({ ...policyFormData, font_color: e.target.value })} />
                  <Input label={t('Фонтын хэмжээ', 'Font Size')} type="number" value={policyFormData.fontsize} onChange={(e) => setPolicyFormData({ ...policyFormData, fontsize: e.target.value })} min="12" max="24" />
                  <Input label={t('Фондын өнгө', 'Background')} type="color" value={policyFormData.bg_color} onChange={(e) => setPolicyFormData({ ...policyFormData, bg_color: e.target.value })} />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="active" checked={policyFormData.active} onChange={(e) => setPolicyFormData({ ...policyFormData, active: e.target.checked })} className="rounded" />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">{t('Идэвхтэй', 'Active')}</label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button onClick={() => setModalOpen(false)} variant="secondary">{trans.cancel}</Button>
                    <Button onClick={handleSavePolicy} variant="primary" disabled={loading}>{loading ? t('Хадгалж байна...', 'Saving...') : trans.save}</Button>
                  </div>
                </div>
              )}
            </Modal>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}