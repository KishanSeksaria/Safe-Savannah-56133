// exporting the name of the function to be used externally
module.exports = getDate;

function getDate() {
    // taking current date and time in a variable called today
    let today = new Date();
    
    // creating optional date format to view date and day in our desirable format
    let options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }

    // toLocaleDateString function is used to convert the date format to out desired format using the optional format we created
    return today.toLocaleDateString('en-US', options);
}