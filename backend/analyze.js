const data = require('./tiendo.json');
let totalAccumulated = 0;
let gradedSTC = 0;
let sumGPA = 0;
let sumGPA10 = 0;
let gradedSTC10 = 0;

data.tbStudyPrograms.forEach(p1 => {
  p1.KhoiKienThucs.forEach(p2 => {
    totalAccumulated += p2.SoTinChiNhomDaHoc;
    
    // Test calculating GPA ourselves
    p2.ChuongTrinhDaoTaos.forEach(sub => {
       if (sub.TenHP && !sub.TenHP.includes('Giáo dục Thể chất') && !sub.TenHP.includes('quốc phòng') && !sub.TenHP.includes('Quân sự')) {
           const diem4 = parseFloat(sub.DiemTK_4);
           const diem10 = parseFloat(sub.DiemTK_10);
           const stc = parseFloat(sub.STC);
           if (!isNaN(diem4) && !isNaN(stc)) {
               gradedSTC += stc;
               sumGPA += diem4 * stc;
           }
           if (!isNaN(diem10) && !isNaN(stc)) {
               gradedSTC10 += stc;
               sumGPA10 += diem10 * stc;
           }
       }
    });
  });
});

console.log('Total SoTinChiNhomDaHoc:', totalAccumulated);
console.log('Calculated GPA4:', gradedSTC > 0 ? (sumGPA / gradedSTC) : 0);
console.log('Calculated GPA10:', gradedSTC10 > 0 ? (sumGPA10 / gradedSTC10) : 0);
console.log('Graded STC:', gradedSTC);
