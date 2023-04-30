'use strict';


const getRegion = () => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get("region");
}

let popoverParentElement;
let popoverElement;

const popoverEnvironment = (e) => {
  const region = getRegion();
  const envId = e.target.textContent;

  const ec2_base = `/ec2/v2/home?region=${region}#Instances:tag:elasticbeanstalk:environment-id=${envId}`;
  const alb_base = `/ec2/v2/home?region=${region}#LoadBalancers:tag:elasticbeanstalk:environment-id=${envId}`;
  const asg_base = `/ec2/autoscaling/home?region=${region}#AutoScalingGroups:view=details;filter=${envId}`;
  const cfn_base = `/cloudformation/home?region=${region}#/stacks?filteringText=awseb-${envId}-stack`;

  var element = document.createElement('div');
  element.innerHTML = `
<div id="my-popover">
  <div class="arrow far-left"></div>
  <div class="popover-content">
    <span><a href="${ec2_base}" target="_blank">EC2 Instances</a></span><br>
    <span><a href="${alb_base}" target="_blank">Load Balancer</a></span><br>
    <span><a href="${asg_base}" target="_blank">Auto Scaling Group</a></span><br>
    <span><a href="${cfn_base}" target="_blank">CloudFormation</a></span>
  </div>
</div>`;

  popoverParentElement = e.target;
  popoverElement = e.target.appendChild(element);
};

const popoverInstance = (e) => {
  const region = getRegion();
  const insId = e.target.textContent;

  const ec2_base = `/ec2/v2/home?region=${region}#Instances:instanceId=${insId}`;
  const ssm_base = `/systems-manager/session-manager/${insId}?region=${region}`;

  var element = document.createElement('div');
  element.innerHTML = `
<div id="my-popover">
  <div class="popover-content">
    <span><a href="${ec2_base}" target="_blank">EC2 Instance</a></span><br>
    <span><a href="${ssm_base}" target="_blank">System Manager</a></span><br>
  </div>
</div>`;

  popoverParentElement = e.target;
  popoverElement = e.target.appendChild(element);
};

document.addEventListener("click", (e) => {
  if (popoverElement && popoverParentElement){
    popoverParentElement.removeChild(popoverElement);
    popoverElement = null;
  }

  if (e.target.tagName === "B" && /^i\-[0-9a-z]+/.test(e.target.textContent)) {
    e.stopPropagation();
    popoverInstance(e);
    return;
  }
  if (e.target.tagName === "DIV" && /^e\-[0-9a-z]{10}/.test(e.target.textContent)) {
    e.stopPropagation();
    popoverEnvironment(e);
    return;
  }

// We need to observe capture event in order to dispatch event handler before angular does.
}, {capture: true});
