// ************** Generate the tree diagram	 *****************
var margin = {top: 40, right: 120, bottom: 20, left: 120},
	width = 1400 - margin.right - margin.left,
	height = 1200 - margin.top - margin.bottom;
	
var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("#tree_diagram").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function update(source) {
  d3.select("svg").remove();

  var svg = d3.select("#tree_diagram").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });
  
  nodeEnter.append("circle")
	  .attr("r", 25)
    .attr("stroke", function (d) { return get_node_stroke(d); })
	  .style("fill", function (d) { return get_node_fill(d); });

  nodeEnter.append("text")
	  .attr("y", function(d) { 
		  return d.children || d._children ? -1 : 1; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .text(function(d) { return d.allocated ? ((d.label + " = " + d.value) + 
      (d.value === 1024 ? " B": " K")) : ((d.value) + (d.value === 1024 ? " B": " K")) })
	  .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);
}

function get_node_stroke(node)
{
  if("children" in node && node.remaining === 0)
    return "#0000ff";
  else if( !("children" in node) && node.remaining === 0)
    return "black";
  else
    return "#0000ff";
}

function get_node_fill(node)
{
  if("children" in node && node.remaining === 0)
    return "#ffff00";
  else if( !("children" in node) && node.remaining === 0)
    return "red";
  else
    return "#eff0f1";
}

var data = [ { name: "1 M", value: 1024, remaining: 1024, parent: "null", logical_id: 0, allocated: false, label: "#"} ];
var logical_id = 1;
var labels = 0;
var treeData;
var root;
initializeData();
var queue = [root];
update(root);

function initializeData()
{
  var dataMap = data.reduce(function(map, node)
  {
    map[node.name] = node;
    return map;
  }, {});

  treeData = [];
  data.forEach(function(node)
  {
    // add to parent
    var parent = dataMap[node.parent];
    if (parent) {
    // create child array if it doesn't exist
    (parent.children || (parent.children = []))
    // add node to child array
    .push(node);
    } else {
    // parent is null or missing
    treeData.push(node);
  }
  });

  root = treeData[0];
}

function int_to_ascii(integer)
{
  return String.fromCharCode(65 + integer);
}

function char_to_int(symbol)
{
  return String(symbol).charCodeAt(0);
}

function bfs(node, search_label, found)
{
  if(node.label === search_label)
  {
    if (!(node.allocated))
      return false;
    found = true;
    process_node = node;
    return found;
  }

  if("children" in node && node.children[0] != 0)
  {
    queue.push(node.children[0]);
  }

  if("children" in node && node.children[1] != 0)
  {
    queue.push(node.children[1]);
  }

  queue.shift();
  queue[0] != null ? found = bfs(queue[0], search_label, found) : queue = [root];
  return found;
}

function preorder(node)
{
  if (!("children" in node))
    childless_nodes.push(node);
  if("children" in node)
  {
    preorder(node.children[0]);
    preorder(node.children[1]);
  }
}

//node's parent is deleted.
function remove_node_parent(node)
{
  if(node.value === 1024)
  {
    //reaches root
    return;
  }

  delete node.parent.children;
  queue = [root];
}

function add_node(node)
{
  if("children" in node && node.children.length >= 2)
  {
    //Has children.
    return;
  }

  new_node_value = node.value / 2;
  first_children = { name: String(new_node_value), parent: node, value: new_node_value,
  remaining: new_node_value, logical_id: logical_id++, allocated: false, label: "#" };
  second_children = { name: String(new_node_value), parent: node, value: new_node_value,
  remaining: new_node_value, logical_id: logical_id++, allocated: false, label: "#" };
  node.children = [first_children, second_children];
  queue = [root];
}

//When a node is removed, this function is called and its value is 
//returned to its original value
function update_binary_tree(current, valuetoSum)
{ 
  current.remaining += valuetoSum;
  if (current.logical_id === 0) //Reaches root
    return 0;
  if (current.parent.remaining + valuetoSum === current.parent.value)
    remove_node_parent (current);
  update_binary_tree (current.parent, valuetoSum);
}

function update_table_diagram()
{
  var table = document.getElementById("table_diagram");
  table.deleteRow(-1);
  var tbody = document.getElementsByTagName("tbody")[0];
  var table_content = "<tr>"
  childless_nodes = [];
  preorder(root);
  for(var i = 0; i < childless_nodes.length; i++)
  {
    var node = childless_nodes[i];
    var label_node = node.allocated ? (node.label + " = " + String(node.value)) : (String(node.value));
    if (node.allocated)
      var color = "bgcolor=red";
    else
      var color = "bgcolor=#eff0f1";
    if (node.value === 1024)
      var size = "B";
    else
      var size = "K"
    table_content += "<td class=size" + String(node.value) + " "+ color + ">" + label_node + " " + size + " </td>";
  }
  table_content += "</tr>";
  tbody.innerHTML = table_content;
}
