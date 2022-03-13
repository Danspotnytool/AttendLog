<h1 align="center">ATTENDLOG</h1>
<p align="center"><b>Attendance Monitoring System</b></p>

<p align="center">
  <img src="./paths/static/assets/images/Logo%20as%20Icon.png" height="200px">
</p>

<h2>Introduction</h2>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ever since online classes started, methods of recording attendances became uneasy. School attendance is a baseline factor in determining student success. Attendance is one of the most important because students are more likely to succeed when consistently attending schools. And an attendance record is one of the ways to keep track of a student's progress. So, if there are a lot of students, it would be a lot harder to keep track of students' progress in their academics. In addition to falling behind in academics, a student who is not in school regularly are more relieved to get into difficulties with the low and cause a problem in their communication.</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;As a solution to this, we created a Web-based application as an Attendance Monitoring System to help teachers and students record their attendance with just a click of a button. Our Attendance Monitoring System, AttendLog, is a Web-based application made to record students' daily attendance at the Asian Institute of Computer Studies Montalban. Using this application would help teachers record students' attendance as it is easy to use. This Web-based application ensures an accurate record of students' attendance data. Using this method will also aid in identifying a student's attendance eligibility criterion. And this could help teachers in distinguishing a student's attendance eligibility criterion.</p>

<h2>Creators:</h2>
<li>Baynosa, Daniel John</li>
<li>Turalde, Rine</li>
<li>Marzo, Jhean Glyneth</li>
<li>Flores, Reiuel</li>
<li>Valencia, Daphney Gwen</li>
<li>Flores, Markisaac</li>
<li>Santiago, John Red</li>

<h2>Purpose</h2>
<p>
  This repository is our source code for our Capstone Project named:
  <a href="https://www.attendlog.ga/"><b>A</b>TTEND<b>L</b>OG</a>
  <br>
  The main purpose of this project is to help teachers to monitor their students' attendances.
</p>

<h2>Contribute</h2>
<p>
  This project is open source and you can contribute to it by making a pull request on our repository. 
</p>

<h3>Dependencies</h3>
<p>
  This project depends on the following libraries:
</p>

<table align="center">
    <thead>
        <tr>
            <th align="left">Name</th>
            <th align="center">Version</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td align="left">axios</td>
            <td align="center">0.26.9</td>
        </tr>
        <tr>
            <td align="left">bcrypt</td>
            <td align="center">5.0.1</td>
        </tr>
        <tr>
            <td align="left">cors</td>
            <td align="center">2.8.5</td>
        </tr>
        <tr>
            <td align="left">dotenv</td>
            <td align="center">16.0.0</td>
        </tr>
        <tr>
            <td align="left">express</td>
            <td align="center">4.17.3</td>
        </tr>
        <tr>
            <td align="left">firebase</td>
            <td align="center">9.6.7</td>
        </tr>
        <tr>
            <td align="left">firebase-admin</td>
            <td align="center">10.0.2</td>
        </tr>
        <tr>
            <td align="left">serve-favicon</td>
            <td align="center">2.5.0</td>
        </tr>
        <tr>
            <td align="left">socket.io</td>
            <td align="center">4.4.1</td>
        </tr>
    </tbody>
</table>

<h3>Start Contributing</h3>

1. Clone the Repository
    ```bash
    git clone https://github.com/Danspotnytool/AttendLog.git
    cd AttendLog
    ```
2. Install Dependencies
    ```bash
    npm install
    ```
3. Run the Local Server
    ```bash
    npm run start
    ```
    alternatively, you can run the server with nodemon using the following command:
    ```bash
    npm run nodemon
    ```

<h4>Developer Notes:</h4>

+ This application requires Node.js version 12.22.10 or higher. Lower versions may affect its performance.
+ If you have trouble starting the app for an unknown developer on MacOS, use <a href="https://support.apple.com/en-ph/guide/mac-help/mh40616/mac#:~:text=Open%20a%20Mac%20app%20from,as%20you%20can%20...">`this`</a> link.

<h3>Secrets</h3>
<p>
  This project uses the following environment variables:
</p>

<table align="center">
    <thead>
        <tr>
            <th align="left">Variable Name</th>
            <th align="center">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td align="left">FIREBASE_API_KEY</td>
            <td align="center">The Firebase API key</td>
        </tr>
        <tr>
            <td align="left">FIREBASE_DATABASE_URL</td>
            <td align="center">The Firebase database URL</td>
        </tr>
    </tbody>
</table>

<p>To connect to the firebase database:</p>
<pre>
root:
    sdk/
      admin.json: {
              "type": ""
              "project_id": ""
              "private_key_id": ""
              "private_key": ""
              "client_email": ""
              "client_id": ""
              "auth_uri": ""
              "token_uri": ""
              "auth_provider_x509_cert_url": ""
              "client_x509_cert_url": ""
      }
</pre>