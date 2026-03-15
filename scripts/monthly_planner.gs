/**
 * Monthly Planner Template Generator for Google Sheets
 *
 * Usage:
 * 1. Open a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this script and save
 * 4. Run createMonthlyPlanner() — it will prompt for month and year
 */

function createMonthlyPlanner() {
  var ui = SpreadsheetApp.getUi();

  var monthResponse = ui.prompt("Month", "Enter month number (1-12):", ui.ButtonSet.OK_CANCEL);
  if (monthResponse.getSelectedButton() !== ui.Button.OK) return;
  var month = parseInt(monthResponse.getResponseText());

  var yearResponse = ui.prompt("Year", "Enter year (e.g. 2026):", ui.ButtonSet.OK_CANCEL);
  if (yearResponse.getSelectedButton() !== ui.Button.OK) return;
  var year = parseInt(yearResponse.getResponseText());

  if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
    ui.alert("Invalid input. Please enter a valid month (1-12) and year.");
    return;
  }

  buildPlanner(month, year);
}

function buildPlanner(month, year) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var sheetName = monthNames[month - 1] + " " + year;

  // Create or clear the sheet
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
    sheet.clearFormats();
    sheet.getDataRange().clearDataValidations();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  var dayHeaders = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var numCols = 7;
  var dayNumberHeight = 22;
  var cellHeight = 96; // ~20% larger than original 80

  // -- Colors --
  var headerBg = "#4a86c8";
  var headerFont = "#ffffff";
  var dayNumberBg = "#e8f0fe";
  var weekendBg = "#fff3e0";
  var goalsBg = "#e8f5e9";
  var goalsTitleBg = "#388e3c";
  var borderColor = "#b0bec5";

  // -- Title row --
  var title = monthNames[month - 1] + " " + year;
  sheet.getRange(1, 1, 1, numCols).merge()
    .setValue(title)
    .setFontSize(20)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(headerBg)
    .setFontColor(headerFont);
  sheet.setRowHeight(1, 50);

  // -- Day headers row --
  var headerRow = 2;
  for (var col = 0; col < numCols; col++) {
    sheet.getRange(headerRow, col + 1)
      .setValue(dayHeaders[col])
      .setFontSize(11)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBackground(headerBg)
      .setFontColor(headerFont);
  }
  sheet.setRowHeight(headerRow, 30);

  // -- Calculate calendar grid --
  var firstDay = new Date(year, month - 1, 1);
  var daysInMonth = new Date(year, month, 0).getDate();
  // JS: 0=Sun, convert to Mon=0
  var startDow = (firstDay.getDay() + 6) % 7;
  var totalCells = startDow + daysInMonth;
  var numWeeks = Math.ceil(totalCells / 7);

  // -- Fill calendar cells (2 rows per week: day number + content) --
  var startRow = 3;
  var day = 1;
  for (var week = 0; week < numWeeks; week++) {
    var numberRow = startRow + week * 2;
    var contentRow = numberRow + 1;
    sheet.setRowHeight(numberRow, dayNumberHeight);
    sheet.setRowHeight(contentRow, cellHeight);

    for (var col = 0; col < numCols; col++) {
      var cellIndex = week * 7 + col;
      var numberCell = sheet.getRange(numberRow, col + 1);
      var contentCell = sheet.getRange(contentRow, col + 1);
      var isWeekend = (col === 5 || col === 6);
      var bg = isWeekend ? weekendBg : dayNumberBg;

      if (cellIndex >= startDow && day <= daysInMonth) {
        // Day number row
        numberCell.setValue(day);
        numberCell.setVerticalAlignment("middle");
        numberCell.setHorizontalAlignment("center");
        numberCell.setFontSize(10);
        numberCell.setFontWeight("bold");
        numberCell.setBackground(bg);

        // Content row for notes
        contentCell.setVerticalAlignment("top");
        contentCell.setFontSize(9);
        contentCell.setBackground(bg);
        contentCell.setWrap(true);

        day++;
      } else {
        var emptyBg = isWeekend ? weekendBg : "#f5f5f5";
        numberCell.setBackground(emptyBg);
        contentCell.setBackground(emptyBg);
      }

      // Borders: top+sides on number row, bottom+sides on content row
      numberCell.setBorder(true, true, false, true, false, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
      contentCell.setBorder(false, true, true, true, false, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
    }
  }

  // -- Goals section --
  var goalsStartRow = startRow + numWeeks * 2 + 1;
  var goalsRows = 6;

  // Goals title
  sheet.getRange(goalsStartRow, 1, 1, numCols).merge()
    .setValue("Monthly Goals")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(goalsTitleBg)
    .setFontColor(headerFont);
  sheet.setRowHeight(goalsStartRow, 35);

  // Goal rows with checkboxes
  for (var i = 1; i <= goalsRows; i++) {
    var goalRow = goalsStartRow + i;
    sheet.setRowHeight(goalRow, 30);

    // Checkbox in column 1
    sheet.getRange(goalRow, 1)
      .insertCheckboxes()
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBackground(goalsBg);

    // Goal text area spanning columns 2-7
    sheet.getRange(goalRow, 2, 1, numCols - 1).merge()
      .setValue("")
      .setBackground(goalsBg)
      .setVerticalAlignment("middle")
      .setFontSize(11);

    // Border around the full row
    sheet.getRange(goalRow, 1, 1, numCols)
      .setBorder(true, true, true, true, true, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
  }

  // -- Column widths --
  for (var col = 1; col <= numCols; col++) {
    sheet.setColumnWidth(col, 156);
  }

  // Activate the new sheet
  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert("Planner created: " + sheetName);
}

/**
 * Creates a blank printable calendar template in light grayscale.
 * No prompts — just run it, print, and hand-write the month/days.
 */
function createBlankCalendar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Blank Calendar";

  var sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
    sheet.clearFormats();
    sheet.getDataRange().clearDataValidations();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  var dayHeaders = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var numCols = 7;
  var numWeeks = 6; // 6 rows covers any month
  var dayNumberHeight = 22;
  var cellHeight = 96;

  // -- Light grayscale palette --
  var headerBg = "#e0e0e0";
  var headerFont = "#424242";
  var cellBg = "#fafafa";
  var weekendBg = "#eeeeee";
  var borderColor = "#cccccc";

  // -- Title row (blank, for hand-writing month/year) --
  sheet.getRange(1, 1, 1, numCols).merge()
    .setValue("")
    .setFontSize(20)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(headerBg);
  sheet.setRowHeight(1, 50);
  sheet.getRange(1, 1, 1, numCols)
    .setBorder(true, true, true, true, false, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);

  // -- Day headers row --
  var headerRow = 2;
  for (var col = 0; col < numCols; col++) {
    sheet.getRange(headerRow, col + 1)
      .setValue(dayHeaders[col])
      .setFontSize(11)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBackground(headerBg)
      .setFontColor(headerFont);
  }
  sheet.setRowHeight(headerRow, 30);

  // -- Empty calendar grid (2 rows per week: day number + content) --
  var startRow = 3;
  for (var week = 0; week < numWeeks; week++) {
    var numberRow = startRow + week * 2;
    var contentRow = numberRow + 1;
    sheet.setRowHeight(numberRow, dayNumberHeight);
    sheet.setRowHeight(contentRow, cellHeight);

    for (var col = 0; col < numCols; col++) {
      var numberCell = sheet.getRange(numberRow, col + 1);
      var contentCell = sheet.getRange(contentRow, col + 1);

      var isWeekend = (col === 5 || col === 6);
      var bg = isWeekend ? weekendBg : cellBg;
      numberCell.setBackground(bg);
      contentCell.setBackground(bg);

      numberCell.setBorder(true, true, false, true, false, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
      contentCell.setBorder(false, true, true, true, false, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
    }
  }

  // -- Goals section --
  var goalsStartRow = startRow + numWeeks * 2 + 1;
  var goalsRows = 6;
  var goalsBg = "#f5f5f5";
  var goalsTitleBg = "#e0e0e0";

  // Goals title
  sheet.getRange(goalsStartRow, 1, 1, numCols).merge()
    .setValue("Monthly Goals")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(goalsTitleBg)
    .setFontColor(headerFont);
  sheet.setRowHeight(goalsStartRow, 35);

  // Goal rows — checkbox square + label | description area, alternating bg
  var goalsBgAlt = "#fafafa";
  for (var i = 1; i <= goalsRows; i++) {
    var goalRow = goalsStartRow + i;
    var rowBg = (i % 2 === 0) ? goalsBgAlt : goalsBg;
    sheet.setRowHeight(goalRow, 30);

    // Column 1: hand-drawn checkbox square (☐) + space for a label
    sheet.getRange(goalRow, 1, 1, 2).merge()
      .setValue("[  ]  ")
      .setHorizontalAlignment("left")
      .setVerticalAlignment("middle")
      .setFontSize(14)
      .setBackground(rowBg);

    // Columns 3-7: description area
    sheet.getRange(goalRow, 3, 1, numCols - 2).merge()
      .setValue("")
      .setBackground(rowBg)
      .setVerticalAlignment("middle")
      .setFontSize(11);

    // Border around the full row
    sheet.getRange(goalRow, 1, 1, numCols)
      .setBorder(true, true, true, true, true, false, borderColor, SpreadsheetApp.BorderStyle.SOLID);
  }

  // -- Column widths --
  for (var col = 1; col <= numCols; col++) {
    sheet.setColumnWidth(col, 156);
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert("Blank calendar created — ready to print!");
}
