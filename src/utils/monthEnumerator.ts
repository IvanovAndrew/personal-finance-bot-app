export const getMonthsInRange = (selectedMonth: Date) => {
    const requestedMonths: Date[] = [];
    let currentMonth = new Date(selectedMonth);
    const now = new Date();
    
    while (currentMonth < now) {
        requestedMonths.push(new Date(currentMonth));
    
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    return requestedMonths;
}