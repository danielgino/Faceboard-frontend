
<p align="center">
  <img src="https://github.com/user-attachments/assets/f5783ee3-9716-4606-ac48-422ba553cd1a" alt="Facrboard React Project" width="600"/>
</p>

### Link: https://faceboard-frontend.vercel.app

### The site is still under testing.*

### Full Explanation and instructions coming soon!

# Faceboard - A Modern Social Network 🧑‍🤝‍🧑📱

**Live demo:** [https://faceboard-frontend.vercel.app](https://faceboard-frontend.vercel.app)
*The site is under active testing.*

Faceboard is a full‑featured social network built with a modern web stack. It offers posts (with up to 4 images), likes, comments, a complete friends system, real‑time chat, live notifications (with optional sounds), password resets via email, and a responsive UI that feels great on desktop and mobile.

---

## ✨ Features

* **Posts**: create, edit, and delete posts; attach up to **4 images** (via Cloudinary)
* **Images**: file picker upload, optimized cloud delivery
* **Reactions**: like & comment on posts
* **Comments**: add and delete.
* **Friends System**: request, accept/decline.
* **Chat (Real-time)**: WebSockets (STOMP + SockJS), **unread counters**, **read receipts** (green ✓)
* **Notifications**: full real-time system with **incoming sound support**
* **Authentication & Security**: JWT secured APIs, role handling, **password reset via email**
* **Profile Management**: edit personal details & profile picture
* **Responsive**: fully responsive (desktop ↔ mobile)
* **Error Handling**: friendly **404** and **403 (no permission)** pages

---

## 🧰 Tech Stack

### Frontend

* **React (CRA)** + **React Router**
* **Tailwind CSS** (utility-first styling)
* **shadcn/ui**, **Aceternity**, **Magic UI** (UI components)
* **Axios** (REST)
* **STOMP.js + SockJS** (WebSockets)
* **SweetAlert2**, **Lottie**, **Framer Motion**

### Backend

* **Spring Boot** (REST API + WebSockets)
* **JWT** auth (HS256)
* **MySQL** (relational DB)
* **Cloudinary** SDK (image storage)
* **Java Mail** (password resets)

---

## 📸 Application Screenshots


<p align="center">
  <img src="https://github.com/user-attachments/assets/b5b7972c-0a9f-4371-aee2-892669bf27b7" alt="Facrboard React Project" width="600"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/7e2727ff-916f-490a-897a-a180429d1793" alt="Facrboard React Project" width="600"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/2afa2d48-f3ba-49ff-b362-bc8ff109c778" alt="Facrboard React Project" width="300"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/15243044-49dd-4d1c-98b1-7b60514ca96a" alt="Facrboard React Project" width="300"/>
</p>

---

## ⚙️ MySQL Configuration

### Backend (Spring Boot)

`application.yml` example:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/faceboard?useSSL=false&serverTimezone=UTC
    username: root
    password: your_mysql_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

spring:
  mail:
    host: smtp.yourprovider.com
    port: 587
    username: your_smtp_user
    password: your_smtp_password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

app:
  frontendBaseUrl: http://localhost:3000
  jwtSecret: ${JWT_SECRET:localDevSecretKeyThatIsLongEnoughForHMAC256_123456789}
  cloudinary:
    cloudName: your_cloud_name
    apiKey: your_api_key
    apiSecret: your_api_secret
  cors:
    allowedOrigins: "http://localhost:3000,https://faceboard-frontend.vercel.app"
```

### Maven Dependency

```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

---

## 🚀 Getting Started (Local)

### Backend

```bash
cd server
./mvnw spring-boot:run
```

API will be available at `http://localhost:8080`.

### Frontend

```bash
cd client
npm install
npm start
```

Runs on `http://localhost:3000`.

---

## 📂 Project Structure

```
assets/
│
├─ buttons/
│ ├─ ShareButtom.js
│ ├─ StyleButton.js
│ └─ TransparentButton.js
│
├─ imagelightbox/
│ ├─ GlobalImageLightbox.js
│ └─ ImageLightBox.js
│
├─ inputs/
│ ├─ EditableField.js
│ ├─ GlobalInput.js
│ ├─ InputAlerts.js
│ ├─ PasswordInput.js
│ └─ SearchInput.js
│
├─ loaders/
│ ├─ AlbumPageLoader.js
│ ├─ CardSkeletonLoader.js
│ ├─ CommentLoader.js
│ ├─ FriendsSkeleton.js
│ ├─ GeneralLoadingLogo.js
│ ├─ LikeLoader.js
│ ├─ NoAlbumYet.js
│ ├─ NoPostsYet.js
│ └─ PostLoader.js
│
├─ photos/
│ ├─ github.png
│ ├─ linkedin.png
│ ├─ mail.png
│ ├─ noPhotosYet.png
│ └─ logo/
│ ├─ FaceboardLogo.png
│ ├─ FaceboardLogoV2.png
│ ├─ LogoLoading.png
│ ├─ logoPNG.png
│ ├─ LogoTemp2.png
│ └─ LogoTemp22.png
│
└─ styles/
├─ ChatOverride.css
└─ ImageLightboxOverride.css

components/
│
├─ about/
│ ├─ AboutCard.js
│ ├─ AnimatedMenu.js
│ └─ GalaxyBackground.js
│
├─ interaction/
│ ├─ EmojiLibrary.js
│ ├─ LikeList.js
│ ├─ Notification.js
│ ├─ Search.js
│ └─ StoryBar.js
│
├─ layout/
│ ├─ Feed.js
│ ├─ Footer.js
│ ├─ HeaderBar.js
│ ├─ MainLayout.js
│ └─ SideBar.js
│
├─ posts/
│ ├─ AddComment.js
│ ├─ AddPost.js
│ ├─ Comment.js
│ ├─ Like.js
│ ├─ Post.js
│ └─ PostImages.js
│
└─ profile/
├─ FriendsCard.js
├─ FriendshipActionButton.js
├─ StoryUploadDialog.js
└─ UserDetails.js

context/
├─ FriendshipProvider.js
├─ LightBoxContext.js
├─ MessageProvider.js
├─ NotificationProvider.js
├─ PostProvider.js
├─ SearchProvider.js
├─ StoryProvider.js
├─ useAutoSaveField.js
├─ useProfilePictureUpload.js
├─ UserProvider.js
└─ WebSocketProvider.js

Icons/
├─ HeaderBarIcons.js
├─ HeartIcon.js
├─ RandomIcons.js
└─ SideBarIcons.js

pages/
├─ About.js
├─ Album.js
├─ ForgotPassword.js
├─ Friends.js
├─ Home.js
├─ Login.js
├─ MobileNotifications.js
├─ Page404.js
├─ Profile.js
├─ ResetPassword.js
├─ SearchPage.js
├─ Settings.js
├─ SignUp.js
├─ SinglePostPage.js
├─ Unauthorized.js
└─ chat/
├─ Chat.js
└─ ConversationsList.js

service/
└─ WebSocketHandler.js

utils/
├─ RouteGuard.js
├─ Utils.js
└─ enums/
└─ FriendshipStatus.js
```

---

## 📫 Contact

* **Author:** Daniel Gino
* **Live demo:** [https://faceboard-frontend.vercel.app](https://faceboard-frontend.vercel.app)

---





