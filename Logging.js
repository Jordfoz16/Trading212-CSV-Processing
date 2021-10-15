const debug_log = true;

module.exports = {
    log: function(msg, level){
        if(level == "DEBUG" && debug_log == true){
            console.log("DEBUG - " + msg)
        }else if(level == "INFO"){
            console.log("INFO - " + msg);
        }
    }
}