
function get_issues_array(unformatted_issue_list, i) {
    var temp_array = [];
    unformatted_issue_list.forEach((issue) => {
        if (issue.task_type === i) {
            temp_array.push(issue.ID);
        }
    });
    return temp_array;
}

export default get_issues_array;