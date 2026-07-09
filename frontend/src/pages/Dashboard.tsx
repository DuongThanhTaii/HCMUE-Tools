import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Calculator, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

interface Subject {
  MaHP: string | null;
  TenHP: string;
  STC: string;
  DiemTK_10: string | null;
  DiemTK_4: string | null;
  DiemTK_Chu: string | null;
  IsPass: string | null;
  TongSoTCTichLuyCTDT: number;
}

interface Group {
  BatBuoc: string;
  SoTinChiNhom: number;
  SoTinChiNhomDaHoc: number;
  ChuongTrinhDaoTaos: Subject[];
}

interface KnowledgeBlock {
  TenKhoiKienThuc: string;
  KhoiKienThucs: Group[];
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [flatSubjects, setFlatSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetGPA, setTargetGPA] = useState<number>(3.4);
  const [totalRequiredCredits, setTotalRequiredCredits] = useState(122);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userDataStr = sessionStorage.getItem('user');
    
    if (!token || !userDataStr) {
      navigate('/');
      return;
    }
    
    setUser(JSON.parse(userDataStr));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // 1. Get CTDT
      const programRes = await api.get('/studyprogram');
      let ctdt = '';
      if (programRes.data && programRes.data.length > 0) {
        ctdt = programRes.data[0].StudyProgramID;
      }
      
      if (!ctdt) throw new Error("Không tìm thấy chương trình đào tạo");

      // 2. Get Marks Tien Do
      const marksRes = await api.get(`/marks-tiendo?ctdt=${ctdt}`);
      const data = marksRes.data;
      
      const tbStudyPrograms = data.tbStudyPrograms || [];
      setBlocks(tbStudyPrograms);

      let foundTotalCredits = 122; // default
      const flattenedSubjects: Subject[] = [];
      tbStudyPrograms.forEach((p1: any) => {
        p1.KhoiKienThucs?.forEach((p2: any) => {
          p2.ChuongTrinhDaoTaos?.forEach((sub: any) => {
            if (sub.TongSoTCTichLuyCTDT) foundTotalCredits = sub.TongSoTCTichLuyCTDT;
            flattenedSubjects.push(sub);
          });
        });
      });
      setTotalRequiredCredits(foundTotalCredits);
      setFlatSubjects(flattenedSubjects);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const stats = useMemo(() => {
    let earnedCredits = 0; 
    let sumScore4 = 0;
    let sumScore10 = 0;
    let gradedCredits = 0; 

    // Loại bỏ các môn Giáo dục Thể chất và Giáo dục Quốc phòng
    const filteredSubjects = flatSubjects.filter(s => {
      if (!s.TenHP) return false;
      const t = s.TenHP.toLowerCase();
      if (t.includes('giáo dục thể chất')) return false;
      if (t.includes('quốc phòng') || t.includes('quân sự') || t.includes('kỹ thuật chiến đấu')) return false;
      return true;
    });

    filteredSubjects.forEach(s => {
      const stc = parseFloat(s.STC) || 0;
      const score4 = s.DiemTK_4 ? parseFloat(s.DiemTK_4) : null;
      const score10 = s.DiemTK_10 ? parseFloat(s.DiemTK_10) : null;

      // HCMUE Cumulative GPA (Tích lũy) ONLY counts passed subjects (score4 >= 1.0)
      if (score4 !== null && score4 >= 1.0) {
        earnedCredits += stc;
        if (score10 !== null) {
          gradedCredits += stc;
          sumScore4 += score4 * stc;
          sumScore10 += score10 * stc;
        }
      } else if (s.IsPass === 'x') {
        earnedCredits += stc; // Pass/Fail subject (not affecting GPA)
      }
    });

    const gpa4 = gradedCredits > 0 ? (sumScore4 / gradedCredits).toFixed(2) : '0.00';
    const gpa10 = gradedCredits > 0 ? (sumScore10 / gradedCredits).toFixed(2) : '0.00';

    return { earnedCredits, gpa4: parseFloat(gpa4), gpa10: parseFloat(gpa10), gradedCredits };
  }, [flatSubjects]);

  // Dự tính điểm
  const calculateGoal = () => {
    const currentScore = stats.gpa4 * stats.gradedCredits;
    const remainingCredits = totalRequiredCredits - stats.gradedCredits;
    if (remainingCredits <= 0) return null;
    
    const requiredScore = (targetGPA * totalRequiredCredits) - currentScore;
    const requiredGPA = requiredScore / remainingCredits;
    return requiredGPA.toFixed(2);
  };

  const reqGPA = calculateGoal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-600 h-6 w-6" />
            <h1 className="text-xl font-bold text-gray-900">HCMUE Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-semibold text-gray-900">{user?.FullName}</p>
              <p className="text-gray-500 text-xs">{user?.Id}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Calculator className="h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">GPA (Hệ 4)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gpa4}</p>
            </div>
          </motion.div>
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Award className="h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">GPA (Hệ 10)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gpa10}</p>
            </div>
          </motion.div>
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.3}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><BookOpen className="h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">Tín chỉ tích lũy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.earnedCredits}</p>
            </div>
          </motion.div>
        </div>

        {/* Goal Calculator */}
        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.4}} className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-1">Mục tiêu điểm số</h2>
              <p className="text-blue-100 text-sm">Tính điểm trung bình cần đạt trong các tín chỉ còn lại (Giả sử tổng {totalRequiredCredits} TC)</p>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="flex flex-col">
                <label className="text-xs text-blue-200">Mục tiêu (Hệ 4)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={targetGPA} 
                  onChange={(e) => setTargetGPA(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-b border-blue-300 w-16 text-xl font-bold text-white focus:outline-none focus:border-white text-center"
                />
              </div>
              <ArrowRight className="text-blue-300" />
              <div className="flex flex-col">
                <label className="text-xs text-blue-200">Cần đạt (GPA)</label>
                <span className="text-2xl font-bold text-yellow-300">{reqGPA ? reqGPA : '---'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transcript Table Grouped */}
        <div className="space-y-6">
          {blocks.map((block, bIdx) => (
            <motion.div key={bIdx} initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.5 + bIdx * 0.1}} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-slate-800 text-white border-b border-gray-100">
                <h2 className="text-sm font-bold uppercase">{bIdx}. {block.TenKhoiKienThuc}</h2>
              </div>
              
              {block.KhoiKienThucs?.map((group, gIdx) => (
                <div key={gIdx} className="border-t border-gray-200">
                  <div className="bg-slate-50 p-3 font-semibold text-sm text-gray-700 flex items-center justify-between">
                    <span>Nhóm [{group.BatBuoc}]</span>
                    {group.SoTinChiNhom > 0 && group.SoTinChiNhomDaHoc >= group.SoTinChiNhom && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-bold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        Đã đủ
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#1e3a5f] text-white text-xs border-b border-gray-200">
                          <th className="p-3 font-semibold w-12 text-center">STT</th>
                          <th className="p-3 font-semibold w-32">Mã môn học</th>
                          <th className="p-3 font-semibold">Tên môn học</th>
                          <th className="p-3 font-semibold text-center w-16">Số TC</th>
                          <th className="p-3 font-semibold text-center w-24">Điểm hệ 10</th>
                          <th className="p-3 font-semibold text-center w-24">Điểm hệ 4</th>
                          <th className="p-3 font-semibold text-center w-24">Điểm chữ</th>
                          <th className="p-3 font-semibold text-center w-24">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {group.ChuongTrinhDaoTaos?.map((sub, sIdx) => (
                          <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-center text-gray-500">{sIdx + 1}</td>
                            <td className="p-3 text-gray-600 font-medium">{sub.MaHP || '-'}</td>
                            <td className="p-3 text-gray-900 font-medium">{sub.TenHP}</td>
                            <td className="p-3 text-center text-gray-600">{sub.STC}</td>
                            <td className="p-3 text-center text-gray-600">{sub.DiemTK_10 || '-'}</td>
                            <td className="p-3 text-center text-gray-600">{sub.DiemTK_4 || '-'}</td>
                            <td className="p-3 text-center">
                              {sub.DiemTK_Chu ? (
                                <span className="font-semibold text-gray-800">
                                  {sub.DiemTK_Chu}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              {sub.IsPass === 'x' || parseFloat(sub.DiemTK_4 || '0') >= 1.0 ? (
                                <div className="mx-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
