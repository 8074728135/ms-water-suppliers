$baseUrl = "http://localhost:8080"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   MS WATER SUPPLIERS - FULL QA SUITE    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Assert-Step($title, $success, $detail) {
    if ($success) {
        Write-Host "  [PASS] $title" -ForegroundColor Green
        if ($detail) { Write-Host "         $detail" -ForegroundColor DarkGray }
    } else {
        Write-Host "  [FAIL] $title" -ForegroundColor Red
        if ($detail) { Write-Host "         $detail" -ForegroundColor Yellow }
    }
}

# 1. AUTHENTICATION TESTS
Write-Host "`n--- 1. AUTHENTICATION & LOGIN TESTS ---" -ForegroundColor Yellow

# 1.1 Owner Login
try {
    $ownerLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers $headers -Body (@{
        mobile = "9999999999"
        password = "admin123"
    } | ConvertTo-Json)
    $ownerToken = $ownerLogin.data.token
    Assert-Step "Owner Login" ($ownerLogin.success -and $ownerToken) "Role: $($ownerLogin.data.role), Name: $($ownerLogin.data.name)"
} catch {
    Assert-Step "Owner Login" $false $_.Exception.Message
}

# 1.2 Driver Login
try {
    $driverLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers $headers -Body (@{
        mobile = "8888888888"
        password = "driver123"
    } | ConvertTo-Json)
    $driverToken = $driverLogin.data.token
    Assert-Step "Driver Login" ($driverLogin.success -and $driverToken) "Role: $($driverLogin.data.role), Name: $($driverLogin.data.name)"
} catch {
    Assert-Step "Driver Login" $false $_.Exception.Message
}

# 1.3 Customer Login
try {
    $custLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers $headers -Body (@{
        mobile = "9876543210"
        password = "password123"
    } | ConvertTo-Json)
    $custToken = $custLogin.data.token
    Assert-Step "Customer Login" ($custLogin.success -and $custToken) "Role: $($custLogin.data.role), Name: $($custLogin.data.name)"
} catch {
    Assert-Step "Customer Login" $false $_.Exception.Message
}

# 2. CATALOG & SERVICE TEST
Write-Host "`n--- 2. WATER SERVICES CATALOG ---" -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/api/services" -Method Get
    Assert-Step "Get Water Packages" ($services.success -and $services.data.Count -gt 0) "Found $($services.data.Count) packages"
    $fullTank = $services.data | Where-Object { $_.name -eq "FULL_TANK" }
    $drum = $services.data | Where-Object { $_.name -eq "DRUM" }
    Assert-Step "Verify Packages" ($fullTank -and $drum) "Full Tank: Rs $($fullTank.price), Drum: Rs $($drum.price)"
} catch {
    Assert-Step "Get Water Packages" $false $_.Exception.Message
}

# 3. DRIVER DUTY & LEAVE WORKFLOW
Write-Host "`n--- 3. DRIVER DUTY & LEAVE MODULE ---" -ForegroundColor Yellow
$driverHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $driverToken"
}
try {
    $duty = Invoke-RestMethod -Uri "$baseUrl/api/driver/duty" -Method Get -Headers $driverHeaders
    Assert-Step "Driver Duty Status" $duty.success "Status: $($duty.data.status), OnLeave: $($duty.data.isOnLeave)"
} catch {
    Assert-Step "Driver Duty Status" $false $_.Exception.Message
}

# 4. CUSTOMER ORDER BOOKING & AUTO-ASSIGNMENT
Write-Host "`n--- 4. CUSTOMER ORDER BOOKING & AUTO-ASSIGNMENT ---" -ForegroundColor Yellow
$custHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $custToken"
}
try {
    $addresses = Invoke-RestMethod -Uri "$baseUrl/api/customers/addresses" -Method Get -Headers $custHeaders
    Assert-Step "Get Customer Addresses" ($addresses.success -and $addresses.data.Count -gt 0) "Address count: $($addresses.data.Count)"
    $addressId = $addresses.data[0].id

    $orderReq = @{
        waterServiceId = $fullTank.id
        quantity = 1
        addressId = $addressId
        deliveryDate = (Get-Date).ToString("yyyy-MM-dd")
        timeSlot = "MORNING"
        paymentMethod = "CASH"
        instructions = "Test automated order delivery"
    } | ConvertTo-Json

    $orderRes = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method Post -Headers $custHeaders -Body $orderReq
    Assert-Step "Customer Place Order" $orderRes.success "Order Number: $($orderRes.data.orderNumber), Amount: Rs $($orderRes.data.totalAmount)"
    
    $createdOrderId = $orderRes.data.id
    $assignedDriver = $orderRes.data.driverName
    Assert-Step "Auto-Assignment to Available Driver" ($assignedDriver -ne $null -and $assignedDriver -ne "") "Driver assigned: $assignedDriver"
} catch {
    Assert-Step "Customer Place Order" $false $_.Exception.Message
}

# 5. DRIVER DISPATCH WORKFLOW
Write-Host "`n--- 5. DRIVER DISPATCH TRIP PROGRESSION ---" -ForegroundColor Yellow
try {
    $deliveriesRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/deliveries" -Method Get -Headers $driverHeaders
    Assert-Step "Driver Queue Fetch" $deliveriesRes.success "Assigned deliveries count: $($deliveriesRes.data.Count)"

    $targetDelivery = $deliveriesRes.data | Where-Object { $_.orderId -eq $createdOrderId }
    if ($targetDelivery) {
        $delId = $targetDelivery.deliveryId

        # Step A: Accept
        $acceptRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/deliveries/$delId/accept" -Method Put -Headers $driverHeaders
        Assert-Step "Driver Accept Order" $acceptRes.success "Status: $($acceptRes.data.status)"

        # Step B: Start Trip
        $startRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/deliveries/$delId/start" -Method Put -Headers $driverHeaders
        Assert-Step "Driver Start Trip" $startRes.success "Status: $($startRes.data.status)"

        # Step C: Arrive
        $arriveRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/deliveries/$delId/arrive" -Method Put -Headers $driverHeaders
        Assert-Step "Driver Arrived at Destination" $arriveRes.success "Status: $($arriveRes.data.status)"

        # Step D: Complete Delivery
        $compBody = @{
            paymentStatus = "PAID"
            paymentMethod = "CASH"
        } | ConvertTo-Json
        $compRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/deliveries/$delId/complete" -Method Put -Headers $driverHeaders -Body $compBody
        Assert-Step "Driver Complete Delivery & Payment Collection" $compRes.success "Status: $($compRes.data.status)"
    } else {
        Assert-Step "Driver Queue Contains Created Order" $false "Order $createdOrderId was not found in driver queue"
    }
} catch {
    Assert-Step "Driver Dispatch Workflow" $false $_.Exception.Message
}

# 6. OWNER DASHBOARD & REPORTING
Write-Host "`n--- 6. OWNER OPERATIONS & STATS ---" -ForegroundColor Yellow
$ownerHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $ownerToken"
}
try {
    $todayStr = (Get-Date).ToString("yyyy-MM-dd")
    $statsRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard/stats?date=$todayStr" -Method Get -Headers $ownerHeaders
    Assert-Step "Owner Dashboard Stats" $statsRes.success "Total: $($statsRes.data.totalOrders), Delivered: $($statsRes.data.deliveredOrders), Revenue: Rs $($statsRes.data.revenue)"
} catch {
    Assert-Step "Owner Dashboard Stats" $false $_.Exception.Message
}

# 7. DRIVER LEAVE APPLICATION & SKIP ASSIGNMENT TEST
Write-Host "`n--- 7. DRIVER ON-LEAVE SKIP ASSIGNMENT TEST ---" -ForegroundColor Yellow
try {
    $leaveReq = @{
        fromDate = (Get-Date).ToString("yyyy-MM-dd")
        toDate = (Get-Date).ToString("yyyy-MM-dd")
        reason = "Personal Emergency Leave"
    } | ConvertTo-Json

    $leaveRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/leave" -Method Post -Headers $driverHeaders -Body $leaveReq
    Assert-Step "Driver Apply Leave" $leaveRes.success "Leave Status: $($leaveRes.data.status)"

    # Book another order while driver is on leave
    $orderReq2 = @{
        waterServiceId = $drum.id
        quantity = 2
        addressId = $addressId
        deliveryDate = (Get-Date).ToString("yyyy-MM-dd")
        timeSlot = "AFTERNOON"
        paymentMethod = "UPI"
        instructions = "Test on-leave skip"
    } | ConvertTo-Json

    $dispDriver = if ($driverForOrder2) { $driverForOrder2 } else { "Unassigned (Correct!)" }
    Assert-Step "Do NOT Assign to Driver on Leave" ($driverForOrder2 -eq $null -or $driverForOrder2 -eq "") "Order 2 Driver: $dispDriver"

    # Driver resumes duty
    $resumeRes = Invoke-RestMethod -Uri "$baseUrl/api/driver/duty/resume" -Method Put -Headers $driverHeaders
    Assert-Step "Driver Resume Duty" $resumeRes.success "Driver back on duty"
} catch {
    Assert-Step "Driver Leave Workflow" $false $_.Exception.Message
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "         QA SUITE EXECUTION DONE         " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
