class NODE {
    constructor(peer_review) {
        this.pr = peer_review;
        this.next = null;
    }
}

class LIST {
    constructor() {
        this.front = null;
    }

    findPeerReview(user_id) {
        var curr_node = this.front;

        while (curr_node) {
            if (curr_node.pr.user_id == user_id) {
                return curr_node.pr.score;
            }
            curr_node = curr_node.next;
        }

        return -1;
    }

    addPeerReview(pr) {
        var new_node = new NODE(pr);

        var curr_node = this.front;
        var prev_node = null;
    
        while (curr_node && curr_node.pr.user_id < pr.user_id) {
            prev_node = curr_node;
            curr_node = curr_node.next;
        }
    
        if (prev_node) {
            prev_node.next = new_node;
            new_node.next = curr_node;
        }
        else {
            new_node.next = curr_node;
            this.front = new_node;
        }
    }
}

class PeerReview {
    constructor(s, assessor, user) {
        this.score = s;
        this.assessor_id = assessor;
        this.user_id = user;
    }
}

class Student {
    constructor(n) {
        this.name = n;
        this.number_of_reviews_completed_this_round = 0;
        this.number_of_reviews_not_completed_this_round = 0;
        this.number_of_previous_reviews = 0;
        this.completed_peer_reviews = new LIST();
        this.incompleted_peer_reviews = new LIST();
        this.weight = 1;
        this.bucket = null;
        this.sum_of_deltas = 0;
        this.total_number_of_missed_reviews = 0;
    }

    findPeerReview(user_id) {
        return this.completed_peer_reviews.findPeerReview(user_id);
    }

    setWeight(w) {
        //Cannot have negative weight
        if (w < 0) {
            w = 0;
        }
        this.weight = w;
    }

    setBucket(b) {
        //Range of value for bucket is -1 to 5 inclusive
        if (b < -1) {
            b = -1;
        }
        else if (b > 5) {
            b = 5;
        }
        this.bucket = b;
    }

    setTotalNumMissed(n) {
        if (n < 0) {
            n = 0;
        }
        this.total_number_of_missed_reviews = n;
    }

    setNumPreviousReviews(n) {
        //Cannot have negative previous reviews
        if (n < 0) {
            n = 0;
        }
        this.number_of_previous_reviews = n;
    }

    setSOD(n) {
        this.sum_of_deltas = n;
    }

    addPeerReview(pr) {
        this.number_of_reviews_completed_this_round++;
        this.completed_peer_reviews.addPeerReview(pr);
    }

    addIncompletePeerReview(pr) {
        this.number_of_reviews_not_completed_this_round++;
        this.incompleted_peer_reviews.addPeerReview(pr);
    }
}

//Benchmarks which can be modified
    var WIDTH_OF_STD_DEV_RANGE = 0.10;
    var THRESHOLD = 0.001;
    var COULD_BE_LOWER_BOUND = 0.25;
    var COULD_BE_UPPER_BOUND = 0.75;

    //Benchmarks to determine if enough data to classify a student
        var MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION = 7;
        var MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION = 3;

    //Benchmarks to determine if enough data to calculate assignment grade accurately
        var MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING = 10;
        var MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING = 2/3;

//Constants
var MAX_COMMANDS_PER_LINE = 20;

//Global Variables
var assignment_number = 0;
var max_score_on_this_assignment = 0;
var changing_weights = false;

var all_students = [];
var sorted_students = [];

//Functions
function CalculateDifferences(current_grades, differences) {
    for (var assessor_id = 0; assessor_id < all_students.length; assessor_id++) {
        var total_difference = 0;
        var curr_node = all_students[assessor_id].completed_peer_reviews.front;
        while (curr_node) {
            
            var current_difference = (current_grades[findStudentIndexGivenName(curr_node.pr.user_id)]) - (curr_node.pr.score);
            
            all_students[assessor_id].setSOD(all_students[assessor_id].sum_of_deltas + current_difference);
            total_difference += current_difference * current_difference;
            curr_node = curr_node.next;
        }
        
        if (all_students[assessor_id].number_of_reviews_completed_this_round == 0) {
            differences.push(0);
            continue;
        }
        all_students[assessor_id].setSOD(all_students[assessor_id].sum_of_deltas / all_students[assessor_id].number_of_reviews_completed_this_round);
        
        differences.push(total_difference / all_students[assessor_id].number_of_reviews_completed_this_round);
    }
    
    //Calculate mean difference
    var mean_difference = 0;
    for (var i = 0; i < all_students.length; i++) {
        mean_difference += differences[i];
    }
    mean_difference /= all_students.length;
    
    return mean_difference;
}

function CalculateWeightedGrades(current_grades) {
    for (var user_id_index = 0; user_id_index < all_students.length; user_id_index++) {
        var total_weighted_score = 0;
        var total_weights = 0;
        for (var assessor_id = 0; assessor_id < all_students.length; assessor_id++) {
            var score = all_students[assessor_id].findPeerReview(all_students[user_id_index].name);
            if (score != -1) {
                total_weighted_score += score * all_students[assessor_id].weight;
                total_weights += all_students[assessor_id].weight;
            }
        }
        
        current_grades[user_id_index] = total_weighted_score / total_weights;
    }
}

function CalculateWeights(new_weights, mean_difference, differences) {
    for (var i = 0; i < all_students.length; i++) {
        //Temporarily leave students' weights if they always graded the weighted average for each review
        if (differences[i] == 0) {
            continue;
        }
        
        new_weights.push(mean_difference / differences[i]);
        if (new_weights[i] > 2) {
            new_weights[i] = 2 + Math.log10(new_weights[i] - 1);
        }
        
        if (all_students[i].number_of_reviews_not_completed_this_round != 0) {
            new_weights[i] = new_weights[i] * (all_students[i].number_of_reviews_completed_this_round / (all_students[i].number_of_reviews_completed_this_round + all_students[i].number_of_reviews_not_completed_this_round));
        }
        
        if (Math.abs(new_weights[i] - all_students[i].weight) > THRESHOLD) {
            changing_weights = true;
        }
        
        all_students[i].setWeight(new_weights[i]);
    }
}

/* Bucket meanings
 -1 - spazzy (definitely harsh or lenient, but fluctuates between them)
 0 - definitely harsh
 1 - could be harsh
 2 - could be lenient
 3 - definitely lenient
 4 - could be fair
 5 - definitely fair
 */

function DetermineBuckets() {
    var spazzy_lower_bound, spazzy_upper_bound;
    var mean_sod_below_25th_percentile = 0.0;
    var num_contributing_to_mean_sod = 0;
    for (var i = 0; i < sorted_students.length; i++) {
        if ((i+1) / sorted_students.length <= COULD_BE_LOWER_BOUND) {
            mean_sod_below_25th_percentile += sorted_students[i].sum_of_deltas;
            num_contributing_to_mean_sod++;
        }
        else {
            break;
        }
    }
    
    mean_sod_below_25th_percentile /= num_contributing_to_mean_sod;
    
    var std_dev_below_25th_percentile = 0.0;
    for (var i = 0; i < sorted_students.length; i++) {
        if ((i+1) / sorted_students.length <= COULD_BE_LOWER_BOUND) {
            std_dev_below_25th_percentile += (sorted_students[i].sum_of_deltas - mean_sod_below_25th_percentile) * (sorted_students[i].sum_of_deltas - mean_sod_below_25th_percentile);
        }
        else {
            break;
        }
    }
    
    std_dev_below_25th_percentile /= num_contributing_to_mean_sod;
    std_dev_below_25th_percentile = Math.sqrt(std_dev_below_25th_percentile);
    
    spazzy_lower_bound = mean_sod_below_25th_percentile - (WIDTH_OF_STD_DEV_RANGE * std_dev_below_25th_percentile);
    spazzy_upper_bound = mean_sod_below_25th_percentile + (WIDTH_OF_STD_DEV_RANGE * std_dev_below_25th_percentile);
    
    for (var i = 0; i < sorted_students.length; i++) {
        var curr_student = sorted_students[i];
        var weight = curr_student.weight;
        var sod = curr_student.sum_of_deltas;
        
        //Determine if there are enough reviews to correctly sort students into buckets
        if (assignment_number > MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION || (curr_student.number_of_reviews_completed_this_round + curr_student.number_of_previous_reviews >= MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION)) {
            
            //Definitely harsh OR definitely lenient OR spazzy
            if ((i+1) / sorted_students.length <= COULD_BE_LOWER_BOUND) {
                //Definitely harsh
                if (sod > spazzy_upper_bound) {
                    sorted_students[i].setBucket(0);
                }
                //Definitely lenient
                else if (sod < spazzy_lower_bound) {
                    sorted_students[i].setBucket(2);
                }
                //Spazzy
                else {
                    sorted_students[i].setBucket(-1);
                }
            }
            //Could be harsh OR could be lenient OR could be fair
            else if ((i+1) / sorted_students.length <= COULD_BE_UPPER_BOUND) {
                //Could be fair
                if (weight > 1) {
                    sorted_students[i].setBucket(4);
                }
                //Could be harsh OR could be lenient
                else {
                    //Could be harsh
                    if (sod > 0) {
                        sorted_students[i].setBucket(1);
                    }
                    //Could be lenient
                    else {
                        sorted_students[i].setBucket(3);
                    }
                }
            }
            //Definitely fair
            else {
                sorted_students[i].setBucket(5);
            }
        }
        //Not enough data points to sort
        else {
            //Could be fair
            if (weight > 1) {
                sorted_students[i].setBucket(4);
            }
            //Could be harsh OR could be lenient
            else {
                //Could be harsh
                if (sod > 0) {
                    sorted_students[i].setBucket(1);
                }
                //Could be lenient
                else {
                    sorted_students[i].setBucket(3);
                }
            }
        }
    }
}

function findMedianWeight(start, end) {
    if (start == end) {
        return all_students[start].weight;
    }
    if (end - start % 2 == 0) {
        return all_students[start + ((end - start)/2)].weight;
    }
    return (all_students[start + ((end - start - 1)/2)].weight + all_students[start + ((end - start + 1)/2)].weight) / 2;
}

function findStudentIndexGivenName(name) {
    for (var i = 0; i < all_students.length; i++) {
        if (all_students[i].name == name) {
            return i;
        }
    }
    return -1;
}

function SortArrayByWeight() {
    //Sorted using bubble sort algorithm
    sorted_students = all_students;
    var swapped = true;
    while (swapped) {
        swapped = false;
        for (var i = 0; i < sorted_students.length - 1; i++) {
            if (sorted_students[i].weight > sorted_students[i+1].weight) {
                var temp = sorted_students[i+1];
                sorted_students[i+1] = sorted_students[i];
                sorted_students[i] = temp;
                swapped = true;
            }
        }
    }
}

export function finalizing(analyzing, max_score) {
    //Read peer review data for the current assignment
    ReadData("sampledataset.csv");

    HardcodeData();
    
    max_score_on_this_assignment = max_score;
    
    var iteration = 0;
    
    //Read old weights from the previous assignment
    if (!ReadInputFile("weights.csv")) {
        return;
    }
    
    //Initialize array of grades
    var current_grades = [];
    for (var i = 0; i < all_students.length; i++) {
        current_grades.push(0);
    }
    
    do {
        iteration++;
        changing_weights = false;
        
        //Step 1
        //Calculate the weighted grades for each submission
        CalculateWeightedGrades(current_grades);
        
        var differences = [];
        
        //Step 2
        //Calculate the differences between reviewers' grades and actual grades for submissions
        var mean_difference = CalculateDifferences(current_grades, differences);
        
        //Step 3
        //Calculate the new weights for each student
        var new_weights = [];
        CalculateWeights(new_weights, mean_difference, differences);

    } while (changing_weights);
    
    //Print out grades
    PrintGrades("grades.csv", current_grades);
    
    //Sort the array
    SortArrayByWeight();
    // sorted_students = all_students.sort();
    
    //Determine which bucket each student falls into
    DetermineBuckets();

    //Print out weights
    PrintWeights("weights.csv");

    var message = "Number of Peer Reviews Completed: 10\nPoints Possible: 10\nMedian Score: 10";
    return message;

    // let messages = [];
    // messages["Num Completed"] = "Number of Peer Reviews Completed: 10";
    // messages["Points Possible"] = "Points Possible: 10"
    // messages["Median Score"] = "Median Score: 10";
    // return messages;
}

export function analyzing() {
    //Read peer review data for the current assignment
    ReadData("sampledataset.csv");

    HardcodeData();

    var all_reviews = true;
    for (var i = 0; i < all_students.length; i++) {
        if (all_students[i].number_of_reviews_not_completed_this_round != 0) {
            all_reviews = false;
            break;
        }
    }
    if (all_reviews) {
        return "All reviews accounted for ";
    }
    
    var enough_data = true;
    for (var i = 0; i < all_students.length; i++) {
        var num_times_reviewee = 0;
        for (var assessor_id = 0; assessor_id < all_students.length; assessor_id++) {
            if (all_students[assessor_id].findPeerReview(all_students[i].name) != -1) {
                num_times_reviewee++;
            }
        }
        if (num_times_reviewee < MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING && (num_times_reviewee / (all_students[i].number_of_reviews_completed_this_round + all_students[i].number_of_reviews_not_completed_this_round)) < MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING) {
            enough_data = false;
            break;
        }
    }
    if (enough_data) {
        return "Not all reviews accounted for, but enough data to accurately calculate every grade";
    }
    else {
        return "Not all reviews accounted for AND not enough data to accurately calculate every grade";
    }
}

export function DetermineMaxScore() {
    return 10;
}

export function resetArrays() {
    all_students = [];
    sorted_students = [];
}