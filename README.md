FlyBoard:
A web application that allows users to search for  real-time flight informations using the AeroDataBox API via RapidAPI. This web project is deployed on two web servers (web-01, web-02) using Nginx, and HAproxy is used for load balancing.


Features:

- Searching using flights by airline name, airport code or city.
- Filter by flight status (Unknown, Expected)
- Sort between time or airline
- Quick search option (KGl, LAX, DXB)
- Choose between departure and arrivals
- Browse results with pagination

API Credits:
This project uses the AeroSpace API (https://rapidapi.com/aedbx-aedbx/api/aerodatabox)
Documentation: https://doc.aerodatabox.com/

FlyBoard was built using:
- HTML, JavaScript and CSS
- Server: Nginx = HAproxy
- API: AeroDataBox by RapidAPI

Deployment:
On web-01 and web-02:
1. Install Nginx and required packages 
   sudo apt update sudo apt install -y nginx
2. Clone the repo and copy files to Nginx  
3. Configure Nginx and restart 
   sudo systemctl restart nginx

On lb-01(HAproxy):
1. Configure HA proxy for load balancing using round-robin between web-01 and web-02
sudo systemctl restart haproxy

Docker: 
Containerized on web-01 and web-02:
docker build -t flyboard .
docker run -d -p 8080:80 flyboard

Bonus:
- Docker on web-01 and web-02
- Caching API to reduce load times and improve efficiency
- Input sanitization for XSS protection and sql injections

Load Balancer URL : http://13.219.84.224

Demo Video: https://youtu.be/3_BYmP51ICk

Website link: https://dalynahgasarasi.github.io/fly-board_summative/
