function onKeyDown (event)
{
  if (event.keyCode === 13)
    makeRequest();
}

function makeRequest ()
{
  if (document.getElementById("request").checked)
  {
    var amount = parseInt (document.getElementById('inputRequest').value);
    if (amount > 1024)
      alert ("Process is too big for memory.");
    else if (amount <= 0)
    {
      alert ("Process needs to be greater than 0.")
    }
    else 
    {
      if (isNaN(amount))
      {
        alert("Enter a number."); 
      }
      else
      {
        //Correct input, and appends to history div.
        request (root, amount);
        var size = "K";
        if (amount == 1024)
          size = "B";
        $( ".userOperations h2" ).append( "Request " + amount + size + " <br>");
      }
      
    }
  }
  else
  {
    var valid = 0;
    var label_id = document.getElementById('inputRequest').value;
    isNaN(label_id) ? valid = release (label_id): alert ("Enter a process letter.");
    if (valid)
      $( ".userOperations h2" ).append( "Release " + label_id + " <br>");;
  }
  update_table_diagram();
  document.getElementById('inputRequest').value = "";
}


$(document).on('change', 'input:radio[name=options]', function (event) 
{
  var x;
  if (document.getElementById("request").checked)
    x = "Enter number.";
  else
    x = "Enter a process letter.";
  $("#inputRequest").attr("placeholder", x);
});


function request(node, size)
{
  size = Math.pow (2, Math.ceil (Math.log2 (size)));
  if(size > node.value || size > node.remaining)
  {
    alert ("Not enough memory for process. Please release some processes."); // size too big
    return 0;
  }

  node.remaining -= size;

  if(size <= node.value && size > node.value / 2)
  {
    // allocate entire block, no children is created
    node.allocated = true;
    node.label = int_to_ascii(labels++);
    update (root);
    return 1;
  }
  else if (!("children" in node))
  {
    add_node (node);
  }

  if (node.children [0].remaining >= size)
    request (node.children [0],size);
  else if (node.children [1].remaining >= size)
    request (node.children [1], size)
}

//Calls bfs to find node, then deallocates it.
//Then calls update_binary_tree to update tree.
function release (id)
{
  process_node = new Object();
  var found = false;
  found = bfs(queue[0], id, found);

  if (!(found))
  {
    alert ("Process not allocated or in memory. Please enter a valid process letter.");
    return 0;
  }
  process_node.allocated = false;

  queue = [root];
  update_binary_tree(process_node, process_node.value);
  update (root);
  return 1;
}
