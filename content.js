'use strict';


const getRegion = () => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get("region");
}

let popoverElement;

const popoverEnvironment = (e, envId) => {
  const region = getRegion();

  const ec2_base = `/ec2/v2/home?region=${region}#Instances:tag:elasticbeanstalk:environment-id=${envId}`;
  const alb_base = `/ec2/v2/home?region=${region}#LoadBalancers:tag:elasticbeanstalk:environment-id=${envId}`;
  const asg_base = `/ec2/autoscaling/home?region=${region}#AutoScalingGroups:view=details;filter=${envId}`;
  const cfn_base = `/cloudformation/home?region=${region}#/stacks?filteringText=awseb-${envId}-stack`;
  const style = `top:${e.pageY}px;left:${e.pageX}px;min-width: 200px;`;

  var element = document.createElement('div');
  element.innerHTML = `
<div class="popover popover-form-left bottom" id="my-popover" ng-show="instancePopover" style="${style}">
  <div class="arrow far-left"></div>
  <div class="popover-content">
    <span class="ng-binding"><a href="${ec2_base}" target="_blank">EC2 Instances</a></span><br>
    <span class="ng-binding"><a href="${alb_base}" target="_blank">Load Balancer</a></span><br>
    <span class="ng-binding"><a href="${asg_base}" target="_blank">Auto Scaling Group</a></span><br>
    <span class="ng-binding"><a href="${cfn_base}" target="_blank">CloudFormation</a></span>
  </div>
</div>`;

  popoverElement = document.body.appendChild(element);
};

const popoverInstance = (e) => {
  const region = getRegion();
  const insId = e.target.textContent;

  const ec2_base = `/ec2/v2/home?region=${region}#Instances:instanceId=${insId}`;
  const ssm_base = `/systems-manager/session-manager/${insId}?region=${region}`;
  const style = `top:${e.pageY}px;left:${e.pageX}px;min-width: 200px;`;

  var element = document.createElement('div');
  element.innerHTML = `
<div class="popover popover-form-left top" id="my-popover" ng-show="instancePopover" style="${style}">
  <div class="popover-content">
    <span class="ng-binding"><a href="${ec2_base}" target="_blank">EC2 Instance</a></span><br>
    <span class="ng-binding"><a href="${ssm_base}" target="_blank">System Manager</a></span><br>
  </div>
</div>`;

  popoverElement = document.body.appendChild(element);
};

document.addEventListener("click", (e) => {
  if (popoverElement){
    document.body.removeChild(popoverElement);
    popoverElement = null;
  }

  // the element which has instance-id as text textContent clicked
  if (e.target.tagName === "SPAN" && /^i\-[0-9a-z]+/.test(e.target.textContent)) {
    // Note that on health page, insnace popup is meaningless, so we display EC2 link instead.
    e.stopPropagation();
    popoverInstance(e);
    return;
  }
  // the element which has environment-id in child text node clicked
  if (e.target.tagName === "DIV" && e.target.classList.contains("awsui-util-container-header-description")) {
    // Find clicked text node
    const found = [].slice.call(e.target.childNodes)
      .find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.match(/e-[0-9a-z]+/));
    if (found) {
      popoverEnvironment(e, found.nodeValue.replace(/.*(e-[0-9a-z]+).*/, "$1"));
    }
  }

// We need to observe capture event in order to dispatch event handler before angular does.
}, {capture: true});
