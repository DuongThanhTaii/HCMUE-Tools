const data = require('./tiendo.json');
const map = {};
data.tbStudyPrograms.forEach(p1 => p1.KhoiKienThucs.forEach(p2 => p2.ChuongTrinhDaoTaos.forEach(s => {
    if (s.DiemTK_4 !== null && s.DiemTK_4 !== "") {
        if (!map[s.MaHP]) map[s.MaHP] = [];
        map[s.MaHP].push(parseFloat(s.DiemTK_4));
    }
})));

Object.keys(map).forEach(k => {
    if (map[k].length > 1) console.log('Duplicate:', k, map[k]);
});
console.log('Done checking duplicates.');
