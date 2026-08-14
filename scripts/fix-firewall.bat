@echo off
echo Adding Windows Firewall rules for Expo Metro Bundler...
echo.

netsh advfirewall firewall add rule name="Expo Metro 8081 TCP" dir=in action=allow protocol=TCP localport=8081
netsh advfirewall firewall add rule name="Expo Metro 8081 UDP" dir=in action=allow protocol=UDP localport=8081
netsh advfirewall firewall add rule name="Expo Metro 8082 TCP" dir=in action=allow protocol=TCP localport=8082
netsh advfirewall firewall add rule name="Expo Metro 19000 TCP" dir=in action=allow protocol=TCP localport=19000
netsh advfirewall firewall add rule name="Expo Metro 19001 TCP" dir=in action=allow protocol=TCP localport=19001

echo.
echo ✓ Firewall rules added successfully!
echo.
echo Now restart your dev server:
echo   bun run dev
echo.
pause
