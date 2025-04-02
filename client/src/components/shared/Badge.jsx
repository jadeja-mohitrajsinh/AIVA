/*=================================================================
* Project: AIVA-WEB
* File: Button.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Button component for displaying buttons.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React from 'react';
import clsx from 'clsx';

const Badge = ({ 
  label, 
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon
}) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className={clsx('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {label}
    </span>
  );
};

export default Badge; 