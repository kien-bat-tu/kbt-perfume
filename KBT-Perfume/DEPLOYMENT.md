# Triển khai KBT Perfume

## Chuẩn bị

Đứng trong thư mục `KBT-Perfume` và đăng nhập Firebase CLI:

```powershell
npm install
firebase login
```

Project đã được cấu hình mặc định là `kbt-perfume` trong `.firebaserc`.

## Kiểm tra production

```powershell
npm run lint
npm run build
npm run preview
```

## Deploy Hosting

```powershell
npm run deploy:hosting
```

## Deploy Hosting và Firestore

```powershell
npm run deploy:firebase
```

Lệnh cuối sẽ publish:

- `firestore.rules`
- `firestore.indexes.json`
- ứng dụng production trong thư mục `dist`

Sau khi deploy, kiểm tra lại Authentication, Firestore, Storage và các route `/customer` và `/admin` trên domain Hosting.
