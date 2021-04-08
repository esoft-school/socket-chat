$(function() {
  let socket = io.connect("http://localhost:3001");
  let message = $("#message");
  let username = $("#username");
  let send_message = $("#send_message");
  let send_username = $("#send_username");
  let chatroom = $("#chatroom");
  let feedback = $("#feedback");
  let name = $("#name");
  let random = Math.floor(Math.random() * (5));
  let alertClasses = ['secondary', 'danger', 'success', 'warning', 'info', 'light'];
  let alertClass = alertClasses[random];


  send_message.click(() => {
    socket.emit("new_message", {
      message: message.val(),
      className: alertClass
    });
  });

  socket.on("add_message", data => {
    console.log(data)
    feedback.html("");
    message.val("");
    chatroom.append(
      "<div class='alert alert-" +
        data.className +
        "'<b>" +
        data.username +
        "</b>: " +
        data.message +
        "</div>"
    );
  });

  send_username.click(() => {
    socket.emit("change_username", { username: username.val() });
    alert('Success')
  });

  message.bind("keypress", () => {
    socket.emit("typing");
  });

  socket.on("typing", data => {
    feedback.html(
      "<p><i>" + data.username + " prints message..." + "</i></p>"
    );
  });
});
